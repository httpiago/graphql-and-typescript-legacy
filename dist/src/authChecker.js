"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("./resolvers/user");
const genericError_1 = require("./genericError");
const database_1 = require("../database");
const ForbiddenError = genericError_1.default.bind({}, 'FORBIDDEN', "Access denied! You don't have permission for this action!");
/**
 * @see https://typegraphql.ml/docs/authorization.html
 */
const authChecker = ({ context }, roles) => __awaiter(this, void 0, void 0, function* () {
    const { currentUserId } = context;
    // Proibir se não existir um token na solicitação
    if (typeof currentUserId === 'undefined' || currentUserId === null)
        throw new ForbiddenError();
    // Se chegar até aqui e não tiver checagem de permissão em "roles", pode liberar o acesso
    if (typeof roles === 'undefined' || roles.length === 0)
        return true;
    const currentUser = yield database_1.default.select(user_1.userColumns).from('users').where({ id: currentUserId }).first();
    // Proibir se o usuário não tiver a permissão necessária
    if (!roles.includes(currentUser.role))
        throw new ForbiddenError();
    // Usuário logado e com permissão, pode liberar o acesso
    return true;
});
exports.default = authChecker;
