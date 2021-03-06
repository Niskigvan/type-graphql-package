"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
function parseValue(value) {
    if (value === null) {
        return null;
    }
    try {
        return new Date(value);
    }
    catch (err) {
        return null;
    }
}
exports.GraphQLTimestamp = new graphql_1.GraphQLScalarType({
    name: "Timestamp",
    description: "The javascript `Date` as integer. " +
        "Type represents date and time as number of milliseconds from start of UNIX epoch.",
    serialize(value) {
        if (!(value instanceof Date)) {
            throw new Error(`Unable to serialize value '${value}' as it's not instance of 'Date'`);
        }
        return value.getTime();
    },
    parseValue,
    parseLiteral(ast) {
        if (ast.kind === graphql_1.Kind.INT) {
            const num = parseInt(ast.value, 10);
            return new Date(num);
        }
        else if (ast.kind === graphql_1.Kind.STRING) {
            return parseValue(ast.value);
        }
        return null;
    },
});
