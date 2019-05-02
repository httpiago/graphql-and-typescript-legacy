"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorsCode;
(function (ErrorsCode) {
    ErrorsCode[ErrorsCode["UNKNOWN"] = 0] = "UNKNOWN";
    ErrorsCode[ErrorsCode["NOT_FOUND"] = 1] = "NOT_FOUND";
    ErrorsCode[ErrorsCode["FORBIDDEN"] = 2] = "FORBIDDEN";
    ErrorsCode[ErrorsCode["NOT_AUTHENTICATED"] = 3] = "NOT_AUTHENTICATED";
    ErrorsCode[ErrorsCode["QUERY_TOO_COMPLEX"] = 4] = "QUERY_TOO_COMPLEX";
    ErrorsCode[ErrorsCode["BAD_REQUEST"] = 5] = "BAD_REQUEST";
})(ErrorsCode || (ErrorsCode = {}));
class GenericError extends Error {
    constructor(code, message) {
        super();
        this.code = code;
        this.message = message || code;
    }
}
exports.default = GenericError;
