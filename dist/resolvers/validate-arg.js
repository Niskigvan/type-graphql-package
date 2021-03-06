"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ArgumentValidationError_1 = require("../errors/ArgumentValidationError");
async function validateArg(arg, globalValidate, argValidate) {
    const validate = argValidate !== undefined ? argValidate : globalValidate;
    if (validate === false || arg == null || typeof arg !== "object") {
        return arg;
    }
    const validatorOptions = Object.assign({}, typeof globalValidate === "object" ? globalValidate : {}, typeof argValidate === "object" ? argValidate : {});
    if (validatorOptions.skipMissingProperties !== false) {
        validatorOptions.skipMissingProperties = true;
    }
    const { validateOrReject } = await Promise.resolve().then(() => require("class-validator"));
    try {
        if (Array.isArray(arg)) {
            await Promise.all(arg.map(argItem => validateOrReject(argItem, validatorOptions)));
        }
        else {
            await validateOrReject(arg, validatorOptions);
        }
        return arg;
    }
    catch (err) {
        throw new ArgumentValidationError_1.ArgumentValidationError(err);
    }
}
exports.validateArg = validateArg;
