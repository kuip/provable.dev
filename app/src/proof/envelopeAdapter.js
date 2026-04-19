import { keccak256, sha256 } from "@kuip/provable-sdk";

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

function isRecord(value) {
  return typeof value === "object" && value !== null;
}

export function readPath(root, path) {
  let current = root;
  for (const segment of path) {
    if (!isRecord(current) || !(segment in current)) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

function decodeHexString(value) {
  if (!value || typeof value !== "string") return undefined;
  const normalized = value.startsWith("0x") ? value.slice(2) : value;
  if (normalized.length === 0 || normalized.length % 2 !== 0) return undefined;
  if (!/^[0-9a-fA-F]+$/.test(normalized)) return undefined;
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16);
  }
  return textDecoder.decode(bytes);
}

function decodeBase64ToBytes(value) {
  if (typeof value !== "string") return undefined;
  const compact = value.trim().replace(/\s+/g, "");
  if (!compact || !/^[A-Za-z0-9+/_-]+={0,2}$/.test(compact)) return undefined;
  const normalized = compact.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return undefined;
  }
}

export function decodeBase64ToText(value) {
  const bytes = decodeBase64ToBytes(value);
  if (!bytes) {
    throw new Error("Invalid base64 proof data.");
  }
  return textDecoder.decode(bytes);
}

function normalizeHashAlgorithm(value) {
  if (typeof value !== "string") return "sha256";
  const normalized = value.toLowerCase().replace(/_/g, "").replace(/-/g, "");
  return normalized === "keccak256" ? "keccak256" : "sha256";
}

function toDataTypeLabel(value) {
  if (!value) return undefined;
  const decoded = decodeHexString(value) || value;
  return decoded.replace(/\u0000+$/g, "");
}

function uniqueStrings(values) {
  const result = [];
  const seen = new Set();
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getUtf8Bytes(value) {
  return textEncoder.encode(value);
}

export function extractTopLevelDataJson(jsonText) {
  const marker = "\"data\"";
  const markerIndex = jsonText.indexOf(marker);
  if (markerIndex < 0) return undefined;
  const colon = jsonText.indexOf(":", markerIndex + marker.length);
  if (colon < 0) return undefined;
  let i = colon + 1;
  while (i < jsonText.length && /\s/.test(jsonText[i])) i += 1;
  if (i >= jsonText.length) return undefined;
  const first = jsonText[i];

  if (first === "\"") {
    let escaped = false;
    let j = i + 1;
    while (j < jsonText.length) {
      const ch = jsonText[j];
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === "\"") {
        return jsonText.slice(i, j + 1);
      }
      j += 1;
    }
    return undefined;
  }

  if (first === "{" || first === "[") {
    const stack = [first];
    let inString = false;
    let escaped = false;
    let j = i + 1;
    while (j < jsonText.length) {
      const ch = jsonText[j];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === "\"") inString = false;
        j += 1;
        continue;
      }
      if (ch === "\"") {
        inString = true;
        j += 1;
        continue;
      }
      if (ch === "{" || ch === "[") stack.push(ch);
      if (ch === "}" || ch === "]") {
        stack.pop();
        if (stack.length === 0) return jsonText.slice(i, j + 1);
      }
      j += 1;
    }
  }

  let j = i;
  while (j < jsonText.length && jsonText[j] !== "," && jsonText[j] !== "}") j += 1;
  return jsonText.slice(i, j).trim();
}

function inferDataFormat(data, rawEnvelope) {
  if (typeof rawEnvelope.data_format === "string") {
    return rawEnvelope.data_format;
  }
  if (isRecord(data) && "form" in data) {
    return "web_form";
  }
  if (isRecord(data) && ("outerHTML" in data || "scripts" in data)) {
    return "web_page";
  }
  return "";
}

export function createEnvelopeAdapter(rawEnvelope, rawDataJson) {
  const data = rawEnvelope.data;
  const kayros = rawEnvelope.kayros || {};

  function hasTimestampResponse() {
    return readPath(kayros, ["timestamp", "response"]) !== undefined;
  }

  function isV0() {
    return (
      readPath(kayros, ["data", "data_item_hex"]) !== undefined ||
      readPath(kayros, ["data", "computed_hash_hex"]) !== undefined ||
      readPath(kayros, ["success"]) !== undefined
    );
  }

  function getTimestampResponse() {
    return readPath(kayros, ["timestamp", "response"]);
  }

  function getRegisterResponse() {
    const response = getTimestampResponse();
    return readPath(response, ["response"]) || response;
  }

  function getDataHash() {
    if (hasTimestampResponse()) {
      return firstString(
        readPath(kayros, ["hash"]),
        readPath(getRegisterResponse(), ["data_item_hex"]),
        readPath(getRegisterResponse(), ["data", "data_item_hex"]),
        readPath(getTimestampResponse(), ["data", "data_item_hex"]),
        readPath(kayros, ["data", "data_item_hex"])
      );
    }

    return firstString(
      readPath(kayros, ["hash"]),
      readPath(kayros, ["data", "data_item_hex"]),
      readPath(kayros, ["timestamp", "response", "data", "data_item_hex"])
    );
  }

  function getDataType() {
    const raw = firstString(
      readPath(getRegisterResponse(), ["data_type"]),
      readPath(getRegisterResponse(), ["data", "data_type"]),
      readPath(getTimestampResponse(), ["data", "data_type"]),
      readPath(kayros, ["data", "data_type"]),
      readPath(kayros, ["data_type"])
    );
    if (raw) return raw;

    const hex = firstString(
      readPath(getRegisterResponse(), ["data_type_hex"]),
      readPath(getRegisterResponse(), ["data", "data_type_hex"]),
      readPath(getTimestampResponse(), ["data", "data_type_hex"]),
      readPath(kayros, ["data", "data_type_hex"]),
      readPath(kayros, ["data_type_hex"])
    );
    if (!hex) return undefined;
    return decodeHexString(hex) || hex;
  }

  function getDataTypeLabel() {
    return toDataTypeLabel(getDataType());
  }

  function getDataTypeLookupCandidates() {
    const raw = firstString(
      readPath(getRegisterResponse(), ["data_type"]),
      readPath(getRegisterResponse(), ["data", "data_type"]),
      readPath(getTimestampResponse(), ["data", "data_type"]),
      readPath(kayros, ["data", "data_type"]),
      readPath(kayros, ["data_type"])
    );
    const decodedRaw = raw ? decodeHexString(raw) : undefined;
    const type = getDataType();
    const decodedType = type ? decodeHexString(type) : undefined;
    const label = getDataTypeLabel();
    return uniqueStrings([raw, decodedRaw, type, decodedType, label]);
  }

  function getKayrosHash() {
    return firstString(
      readPath(getTimestampResponse(), ["data", "computed_hash_hex"]),
      readPath(getRegisterResponse(), ["data", "computed_hash_hex"]),
      readPath(getRegisterResponse(), ["computed_hash_hex"]),
      readPath(getRegisterResponse(), ["hash"]),
      readPath(kayros, ["data", "computed_hash_hex"])
    );
  }

  function getTimeUUID() {
    return firstString(
      readPath(getRegisterResponse(), ["data", "timeuuid_hex"]),
      readPath(getRegisterResponse(), ["timeuuid_hex"]),
      readPath(getRegisterResponse(), ["data", "timeuuid"]),
      readPath(getRegisterResponse(), ["timeuuid"]),
      readPath(getTimestampResponse(), ["data", "timeuuid_hex"]),
      readPath(getTimestampResponse(), ["data", "timeuuid"]),
      readPath(kayros, ["data", "timeuuid_hex"])
    );
  }

  function getHashAlgorithm() {
    return normalizeHashAlgorithm(readPath(kayros, ["hashAlgorithm"]));
  }

  function getObjectBytes() {
    if (typeof rawDataJson === "string") {
      return getUtf8Bytes(rawDataJson);
    }
    return getUtf8Bytes(JSON.stringify(data));
  }

  function hasCanonicalDataField() {
    return Object.prototype.hasOwnProperty.call(rawEnvelope, "data_format");
  }

  function getData() {
    if (typeof data !== "string") {
      return getObjectBytes();
    }
    const base64Bytes = decodeBase64ToBytes(data);
    if ((isV0() || hasCanonicalDataField()) && base64Bytes) {
      return base64Bytes;
    }
    return getUtf8Bytes(data);
  }

  function getDataText() {
    return textDecoder.decode(getData());
  }

  function parseData() {
    if (typeof data !== "string") {
      return data;
    }

    const text = getDataText();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  function getDataFormat() {
    return inferDataFormat(parseData(), rawEnvelope);
  }

  function getByteCandidates() {
    const candidates = [];
    const seen = new Set();

    function add(bytes) {
      if (!bytes) return;
      const key = bytesToHex(bytes);
      if (seen.has(key)) return;
      seen.add(key);
      candidates.push(bytes);
    }

    if (typeof data === "string") {
      const utf8Bytes = getUtf8Bytes(data);
      const base64Bytes = decodeBase64ToBytes(data);
      if (isV0() || hasCanonicalDataField()) {
        add(base64Bytes);
        add(utf8Bytes);
      } else {
        add(utf8Bytes);
        add(base64Bytes);
      }
      return candidates;
    }

    if (typeof rawDataJson === "string") {
      add(getUtf8Bytes(rawDataJson));
    }
    add(getUtf8Bytes(JSON.stringify(data)));
    return candidates;
  }

  async function digest(bytes, algorithm) {
    if (algorithm === "keccak256") {
      return keccak256(bytes);
    }
    return sha256(bytes);
  }

  async function computeDataHash() {
    const preferred = getHashAlgorithm();
    const alternate = preferred === "keccak256" ? "sha256" : "keccak256";
    const expected = getDataHash() ? getDataHash().toLowerCase().replace(/^0x/, "") : undefined;

    const candidates = getByteCandidates();
    if (expected) {
      for (const bytes of candidates) {
        const preferredHash = await digest(bytes, preferred);
        if (preferredHash === expected) return preferredHash;
        const alternateHash = await digest(bytes, alternate);
        if (alternateHash === expected) return alternateHash;
      }
    }

    return digest(getData(), preferred);
  }

  return {
    data,
    data_format: typeof rawEnvelope.data_format === "string" ? rawEnvelope.data_format : undefined,
    kayros,
    getDataHash,
    getDataType,
    getDataTypeLabel,
    getDataTypeLookupCandidates,
    getKayrosHash,
    getTimeUUID,
    getHashAlgorithm,
    getDataFormat,
    getData,
    getDataText,
    parseData,
    computeDataHash,
    isV0,
    toJSON() {
      return rawEnvelope;
    }
  };
}

export function isEnvelope(value) {
  return isRecord(value) && "data" in value && "kayros" in value;
}
