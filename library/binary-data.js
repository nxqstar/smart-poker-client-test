"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryParser = exports.BinaryBuilder = void 0;
const data_type_1 = require("./data-type");
class BinaryBuilder {
    constructor() {
        this.handlers = new Map();
        this.registerHandlers();
    }
    registerHandler(dataType, handler) {
        this.handlers.set(dataType, handler);
    }
    registerHandlers() {
        this.registerHandler(data_type_1.BinaryDataType.INT8, this.writeInt8.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.INT16, this.writeInt16.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.INT32, this.writeInt32.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.INT64, this.writeInt64.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.UINT8, this.writeUInt8.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.UINT16, this.writeUInt16.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.UINT32, this.writeUInt32.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.UINT64, this.writeUInt64.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.FLOAT, this.writeFloat.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.DOUBLE, this.writeDouble.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.STRING, this.writeString.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.OBJECT, this.writeUInt32.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.ARRAY, this.writeUInt32.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.OBJECT_ARRAY, this.writeUInt32.bind(this));
    }
    writeData(dataType, value) {
        const handler = this.handlers.get(dataType);
        if (handler) {
            return handler(value);
        }
        else {
            console.log('BINARY BUILDER HANDLER REGISTERED NOT YET', dataType);
            return null;
        }
    }
    buildData(data, struct, isBigEndian = false) {
        const bufferArray = [];
        if (typeof data == undefined || typeof struct == undefined) {
            throw new Error(`BINARY DATA BUILDER BUILDDATA ERROR, DATA OR STRUCT IS UNDEFINED`);
        }
        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                bufferArray.push(this.buildData(data[i], struct));
            }
            return Buffer.concat(bufferArray);
        }
        for (const key in struct) {
            if (struct.hasOwnProperty(key)) {
                if (key.indexOf("_struct") != -1)
                    continue;
                if (key.indexOf("_type") != -1)
                    continue;
                if (key.indexOf("_arrayStruct") != -1)
                    continue;
                if (struct[key] == data_type_1.BinaryDataType.OBJECT) {
                    if (typeof struct[`${key}_struct`] == undefined) {
                        throw new Error(`Build data error, Object ${key} doesn't have struct defined`);
                    }
                    for (const skey in struct[`${key}_struct`]) {
                        bufferArray.push(this.buildData(data[key], struct[`${key}_struct`]));
                    }
                }
                else if (struct[key] == data_type_1.BinaryDataType.ARRAY) {
                    if (typeof struct[`${key}_type`] == undefined) {
                        throw new Error(`Build data error, Array ${key} doesn't have type defined`);
                    }
                    bufferArray.push(this.writeData(struct[key], data[key].length));
                    if (data[key].length > 0) {
                        bufferArray.push(this.buildArrayData(data[key], struct[`${key}_type`]));
                    }
                }
                else if (struct[key] == data_type_1.BinaryDataType.OBJECT_ARRAY) {
                    if (typeof struct[`${key}_arrayStruct`] == undefined) {
                        throw new Error(`Build data error, Object Array ${key} doesn't have arrayStruct defined`);
                    }
                    bufferArray.push(this.writeData(struct[key], data[key].length));
                    if (data[key].length > 0) {
                        bufferArray.push(this.buildData(data[key], struct[`${key}_arrayStruct`]));
                    }
                }
                else {
                    bufferArray.push(this.writeData(struct[key], data[key]));
                }
            }
        }
        return Buffer.concat(bufferArray);
    }
    buildArrayData(data, type) {
        const bufferArray = [];
        for (let i = 0; i < data.length; i++) {
            bufferArray.push(this.writeData(type, data[i]));
        }
        return Buffer.concat(bufferArray);
    }
    addHeader(event, data, isBigEndian = false) {
        const header = Buffer.alloc(4);
        if (isBigEndian) {
            header.writeUInt32BE(event, 0);
        }
        else {
            header.writeUInt32LE(event, 0);
        }
        return Buffer.concat([header, data || []]);
    }
    buildPacket(event, data, struct) {
        const body = this.buildData(data, struct);
        return this.addHeader(event, body);
    }
    writeInt8(value) {
        const buffer = Buffer.alloc(1);
        try {
            buffer.writeInt8(value, 0);
        }
        catch (e) {
            buffer.writeInt8(0, 0);
        }
        return buffer;
    }
    writeInt16(value, isBigEndian = false) {
        const buffer = Buffer.alloc(2);
        if (isBigEndian) {
            try {
                buffer.writeInt16BE(value, 0);
            }
            catch (e) {
                buffer.writeInt16BE(0, 0);
            }
        }
        else {
            try {
                buffer.writeInt16LE(value, 0);
            }
            catch (e) {
                buffer.writeInt16LE(0, 0);
            }
        }
        return buffer;
    }
    writeInt32(value, isBigEndian = false) {
        const buffer = Buffer.alloc(4);
        if (isBigEndian) {
            try {
                buffer.writeInt32BE(value, 0);
            }
            catch (e) {
                buffer.writeInt32BE(0, 0);
            }
        }
        else {
            try {
                buffer.writeInt32LE(value, 0);
            }
            catch (e) {
                buffer.writeInt32LE(0, 0);
            }
        }
        return buffer;
    }
    writeInt64(value, isBigEndian = false) {
        const buffer = Buffer.alloc(8);
        if (isBigEndian) {
            try {
                buffer.writeInt32BE((value % 0x7FFFFFFF), 0);
                buffer.writeInt32BE((value / 0x7FFFFFFF), 4);
            }
            catch (e) {
                buffer.writeInt32BE(0, 0);
                buffer.writeInt32BE(0, 4);
            }
        }
        else {
            try {
                buffer.writeInt32LE((value % 0x7FFFFFFF), 0);
                buffer.writeInt32LE((value / 0x7FFFFFFF), 4);
            }
            catch (e) {
                buffer.writeInt32LE(0, 0);
                buffer.writeInt32LE(0, 4);
            }
        }
        return buffer;
    }
    writeUInt8(value) {
        const buffer = Buffer.alloc(1);
        try {
            buffer.writeUInt8(value, 0);
        }
        catch (e) {
            buffer.writeUInt8(0, 0);
        }
        return buffer;
    }
    writeUInt16(value, isBigEndian = false) {
        const buffer = Buffer.alloc(2);
        if (isBigEndian) {
            try {
                buffer.writeUInt16BE(value, 0);
            }
            catch (e) {
                buffer.writeUInt16BE(0, 0);
            }
        }
        else {
            try {
                buffer.writeUInt16LE(value, 0);
            }
            catch (e) {
                buffer.writeUInt16LE(0, 0);
            }
        }
        return buffer;
    }
    writeUInt32(value, isBigEndian = false) {
        const buffer = Buffer.alloc(4);
        if (isBigEndian) {
            try {
                buffer.writeUInt32BE(value, 0);
            }
            catch (e) {
                buffer.writeUInt32BE(0, 0);
            }
        }
        else {
            try {
                buffer.writeUInt32LE(value, 0);
            }
            catch (e) {
                buffer.writeUInt32LE(0, 0);
            }
        }
        return buffer;
    }
    writeUInt64(value, isBigEndian = false) {
        const buffer = Buffer.alloc(8);
        if (isBigEndian) {
            try {
                buffer.writeUInt32BE((value % 0xFFFFFFFF), 0);
                buffer.writeUInt32BE((value / 0xFFFFFFFF), 4);
            }
            catch (e) {
                buffer.writeUInt32BE(0, 0);
                buffer.writeUInt32BE(0, 4);
            }
        }
        else {
            try {
                buffer.writeUInt32LE((value / 0xFFFFFFFF), 0);
                buffer.writeUInt32LE((value % 0xFFFFFFFF), 4);
            }
            catch (e) {
                buffer.writeUInt32LE(0, 0);
                buffer.writeUInt32LE(0, 4);
            }
        }
        return buffer;
    }
    writeFloat(value, isBigEndian = false) {
        const buffer = Buffer.alloc(4);
        if (isBigEndian) {
            try {
                buffer.writeFloatBE(value, 0);
            }
            catch (e) {
                buffer.writeFloatBE(0, 0);
            }
        }
        else {
            try {
                buffer.writeFloatLE(value, 0);
            }
            catch (e) {
                buffer.writeFloatLE(0, 0);
            }
        }
        return buffer;
    }
    writeDouble(value, isBigEndian = false) {
        const buffer = Buffer.alloc(8);
        if (isBigEndian) {
            try {
                buffer.writeDoubleBE(value, 0);
            }
            catch (e) {
                buffer.writeDoubleBE(0, 0);
            }
        }
        else {
            try {
                buffer.writeDoubleLE(value, 0);
            }
            catch (e) {
                buffer.writeDoubleLE(0, 0);
            }
        }
        return buffer;
    }
    writeString(str, isBigEndian = false) {
        const buffer = Buffer.alloc(str.length * 2 + 2);
        buffer.fill(0);
        let i = 0;
        if (isBigEndian) {
            for (i = 0; i < str.length; i++) {
                buffer.writeUint16BE(str.charCodeAt(i), i * 2);
            }
        }
        else {
            for (i = 0; i < str.length; i++) {
                buffer.writeUint16LE(str.charCodeAt(i), i * 2);
            }
        }
        return buffer;
    }
}
exports.BinaryBuilder = BinaryBuilder;
class BinaryParser {
    constructor() {
        this.handlers = new Map();
        this.registerHandlers();
    }
    registerHandler(dataType, handler) {
        this.handlers.set(dataType, handler);
    }
    registerHandlers() {
        this.registerHandler(data_type_1.BinaryDataType.INT8, this.readInt8.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.INT16, this.readInt16.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.INT32, this.readInt32.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.INT64, this.readInt64.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.UINT8, this.readUInt8.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.UINT16, this.readUInt16.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.UINT32, this.readUInt32.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.UINT64, this.readUInt64.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.FLOAT, this.readFloat.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.DOUBLE, this.readDouble.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.STRING, this.readString.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.OBJECT, this.readUInt32.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.ARRAY, this.readUInt32.bind(this));
        this.registerHandler(data_type_1.BinaryDataType.OBJECT_ARRAY, this.readUInt32.bind(this));
    }
    readData(dataType, data, offset) {
        const handler = this.handlers.get(dataType);
        if (handler) {
            return handler(data, offset);
        }
        else {
            console.log(`BINARY PARSER HANDLER REGISTERED NOT YET ${dataType}`);
            return null;
        }
    }
    parseData(data, struct, offset = 0, isBigEndian = false) {
        const obj = {};
        for (const key in struct) {
            if (key.indexOf("_struct") != -1)
                continue;
            if (key.indexOf("_type") != -1)
                continue;
            if (key.indexOf("_arrayStruct") != -1)
                continue;
            if (struct[key] == data_type_1.BinaryDataType.OBJECT) {
                obj[key] = {};
                for (const skey in struct[`${key}_struct`]) {
                    const objectData = this.parseData(data, struct[`${key}_struct`], offset);
                    obj[key] = Object.assign({}, objectData.obj);
                    offset = objectData.offset;
                }
            }
            else if (struct[key] == data_type_1.BinaryDataType.ARRAY) {
                const lenData = this.readData(struct[key], data, offset);
                offset += lenData.step;
                obj[key] = [];
                for (let i = 0; i < lenData.result; i++) {
                    const arrayData = this.readData(struct[`${key}_type`], data, offset);
                    obj[key].push(arrayData.result);
                    offset += arrayData.step;
                }
            }
            else if (struct[key] == data_type_1.BinaryDataType.OBJECT_ARRAY) {
                const lenData = this.readData(struct[key], data, offset);
                offset += lenData.step;
                obj[key] = [];
                for (let i = 0; i < lenData.result; i++) {
                    const objectArrayData = this.parseData(data, struct[`${key}_arrayStruct`], offset);
                    obj[key].push(objectArrayData.obj);
                    offset = objectArrayData.offset;
                }
            }
            else {
                const { result, step } = this.readData(struct[key], data, offset);
                obj[key] = result;
                offset += step;
            }
        }
        return { obj, offset };
    }
    parsePacket(buffer) {
        const headerData = this.readUInt32(buffer, 0);
        let offset = headerData.step;
        const body = buffer.subarray(offset, buffer.length);
        return { gameEvent: headerData.result, body };
    }
    readInt8(buffer, offset) {
        let result;
        result = buffer.readInt8(offset);
        const step = 1;
        return { result, step };
    }
    readInt16(buffer, offset, isBigEndian = false) {
        const step = 2;
        let result;
        if (isBigEndian) {
            result = buffer.readInt16BE(offset);
        }
        else {
            result = buffer.readInt16LE(offset);
        }
        return { result, step };
    }
    readInt32(buffer, offset, isBigEndian = false) {
        const step = 4;
        let result;
        if (isBigEndian) {
            result = buffer.readInt32BE(offset);
        }
        else {
            result = buffer.readInt32LE(offset);
        }
        return { result, step };
    }
    readInt64(buffer, offset, isBigEndian = false) {
        const step = 8;
        let result;
        if (isBigEndian) {
            result = buffer.readInt32BE(offset) + buffer.readInt32BE(offset + 4) * 0x7FFFFFFF;
        }
        else {
            result = buffer.readInt32LE(offset) * 0x7FFFFFFF + buffer.readInt32LE(offset + 4);
        }
        return { result, step };
    }
    readUInt8(buffer, offset) {
        let result;
        result = buffer.readUInt8(offset);
        const step = 1;
        return { result, step };
    }
    readUInt16(buffer, offset, isBigEndian = false) {
        const step = 2;
        let result;
        if (isBigEndian) {
            result = buffer.readUInt16BE(offset);
        }
        else {
            result = buffer.readUInt16LE(offset);
        }
        return { result, step };
    }
    readUInt32(buffer, offset, isBigEndian = false) {
        const step = 4;
        let result;
        if (isBigEndian) {
            result = buffer.readUInt32BE(offset);
        }
        else {
            result = buffer.readUInt32LE(offset);
        }
        return { result, step };
    }
    readUInt64(buffer, offset, isBigEndian = false) {
        const step = 8;
        let result;
        if (isBigEndian) {
            result = buffer.readUInt32BE(offset) + buffer.readUInt32BE(offset + 4) * 0xFFFFFFFF;
        }
        else {
            result = buffer.readUInt32LE(offset) * 0xFFFFFFFF + buffer.readUInt32LE(offset + 4);
        }
        return { result, step };
    }
    readFloat(buffer, offset, isBigEndian = false) {
        let result;
        if (isBigEndian) {
            result = buffer.readFloatBE(offset);
        }
        else {
            result = buffer.readFloatLE(offset);
        }
        const step = 4;
        return { result, step };
    }
    readDouble(buffer, offset, isBigEndian = false) {
        const step = 8;
        let result;
        if (isBigEndian) {
            result = buffer.readDoubleBE(offset);
        }
        else {
            result = buffer.readDoubleLE(offset);
        }
        return { result, step };
    }
    readString(buffer, offset, isBigEndian = false) {
        let str = '';
        let totalStep = 0;
        for (let i = offset; i < buffer.length;) {
            const { result, step } = this.readUInt16(buffer, i);
            i += step;
            if (result == 0) {
                break;
            }
            totalStep += step;
            str += String.fromCharCode(result);
        }
        totalStep += 2;
        return { result: str, step: totalStep };
    }
}
exports.BinaryParser = BinaryParser;
