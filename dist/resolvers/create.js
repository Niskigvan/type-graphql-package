"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const types_1 = require("../helpers/types");
const build_context_1 = require("../schema/build-context");
const isPromiseLike_1 = require("../utils/isPromiseLike");
const auth_middleware_1 = require("../helpers/auth-middleware");
function createHandlerResolver(resolverMetadata) {
    const { validate: globalValidate, authChecker, authMode, pubSub, globalMiddlewares, container, } = build_context_1.BuildContext;
    const middlewares = globalMiddlewares.concat(resolverMetadata.middlewares);
    helpers_1.applyAuthChecker(middlewares, authMode, authChecker, resolverMetadata.roles);
    return (root, args, context, info) => {
        const resolverData = { root, args, context, info };
        const targetInstance = container.getInstance(resolverMetadata.target, resolverData);
        return helpers_1.applyMiddlewares(container, resolverData, middlewares, () => {
            const params = helpers_1.getParams(resolverMetadata.params, resolverData, globalValidate, pubSub);
            if (isPromiseLike_1.default(params)) {
                return params.then(resolvedParams => targetInstance[resolverMetadata.methodName].apply(targetInstance, resolvedParams));
            }
            else {
                return targetInstance[resolverMetadata.methodName].apply(targetInstance, params);
            }
        });
    };
}
exports.createHandlerResolver = createHandlerResolver;
function createAdvancedFieldResolver(fieldResolverMetadata) {
    if (fieldResolverMetadata.kind === "external") {
        return createHandlerResolver(fieldResolverMetadata);
    }
    const targetType = fieldResolverMetadata.getObjectType();
    const { validate: globalValidate, authChecker, authMode, pubSub, globalMiddlewares, container, } = build_context_1.BuildContext;
    const middlewares = globalMiddlewares.concat(fieldResolverMetadata.middlewares);
    helpers_1.applyAuthChecker(middlewares, authMode, authChecker, fieldResolverMetadata.roles);
    return (root, args, context, info) => {
        const resolverData = { root, args, context, info };
        const targetInstance = types_1.convertToType(targetType, root);
        return helpers_1.applyMiddlewares(container, resolverData, middlewares, () => {
            const handlerOrGetterValue = targetInstance[fieldResolverMetadata.methodName];
            if (typeof handlerOrGetterValue !== "function") {
                // getter
                return handlerOrGetterValue;
            }
            // method
            const params = helpers_1.getParams(fieldResolverMetadata.params, resolverData, globalValidate, pubSub);
            if (isPromiseLike_1.default(params)) {
                return params.then(resolvedParams => handlerOrGetterValue.apply(targetInstance, resolvedParams));
            }
            else {
                return handlerOrGetterValue.apply(targetInstance, params);
            }
        });
    };
}
exports.createAdvancedFieldResolver = createAdvancedFieldResolver;
function createBasicFieldResolver(fieldMetadata) {
    const { authChecker, authMode, globalMiddlewares, container } = build_context_1.BuildContext;
    const middlewares = globalMiddlewares.concat(fieldMetadata.middlewares);
    helpers_1.applyAuthChecker(middlewares, authMode, authChecker, fieldMetadata.roles);
    return (root, args, context, info) => {
        const resolverData = { root, args, context, info };
        return helpers_1.applyMiddlewares(container, resolverData, middlewares, () => root[fieldMetadata.name]);
    };
}
exports.createBasicFieldResolver = createBasicFieldResolver;
function wrapResolverWithAuthChecker(resolver, roles) {
    const { authChecker, authMode } = build_context_1.BuildContext;
    if (!authChecker || !roles) {
        return resolver;
    }
    return (root, args, context, info) => {
        const resolverData = { root, args, context, info };
        return auth_middleware_1.AuthMiddleware(authChecker, authMode, roles)(resolverData, async () => resolver(root, args, context, info));
    };
}
exports.wrapResolverWithAuthChecker = wrapResolverWithAuthChecker;
