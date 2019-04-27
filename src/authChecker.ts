import { AuthChecker } from 'type-graphql';
import { userColumns } from './resolvers/user';
import { Context } from '../types'
import GenericError from './genericError';
import db from '../database'

const ForbiddenError = GenericError.bind({}, 'FORBIDDEN', "Access denied! You don't have permission for this action!")

/**
 * @see https://typegraphql.ml/docs/authorization.html
 */
const authChecker: AuthChecker<Context> = async ({ context }, roles) => {
  const { currentUserId } = context

  // Proibir se não existir um token na solicitação
  if (typeof currentUserId === 'undefined' || currentUserId === null) throw new ForbiddenError();

  // Se chegar até aqui e não tiver checagem de permissão em "roles", pode liberar o acesso
  if (typeof roles === 'undefined' || roles.length === 0) return true;

  const currentUser = await db.select(userColumns).from('users').where({ id: currentUserId }).first();

  // Proibir se o usuário não tiver a permissão necessária
  if (!roles.includes(currentUser.role)) throw new ForbiddenError();

  // Usuário logado e com permissão, pode liberar o acesso
  return true;
}

export default authChecker