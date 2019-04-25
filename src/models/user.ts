import { ObjectType, Field, ID, registerEnumType } from "type-graphql";

@ObjectType({ description: 'Estrutura dos dados de um usuário cadastrado.' })
class User {
  @Field(type => ID)
  id: string;

  @Field(type => String)
  name: string;

  @Field(type => String)
  email: string;

  @Field(type => String)
  role: keyof typeof Role;
}

enum Role { admin, writer, reader }

export default User