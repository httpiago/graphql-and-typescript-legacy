import { ObjectType, Field, ID } from "type-graphql";

@ObjectType({ description: 'Data structure of a registered user.' })
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