"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_type_1 = require("../library/data-type");
const loginStruct = {
    coin: data_type_1.BinaryDataType.FLOAT,
    user: data_type_1.BinaryDataType.OBJECT,
    user_struct: {
        name: data_type_1.BinaryDataType.STRING,
    },
    history: data_type_1.BinaryDataType.OBJECT_ARRAY,
    history_arrayStruct: {
        id: data_type_1.BinaryDataType.UINT32,
        bet: data_type_1.BinaryDataType.UINT32,
        win: data_type_1.BinaryDataType.UINT32,
    },
    array: data_type_1.BinaryDataType.ARRAY,
    array_type: data_type_1.BinaryDataType.UINT32,
    money: data_type_1.BinaryDataType.DOUBLE,
};
const DataStruct = {
    loginStruct
};
exports.default = DataStruct;
