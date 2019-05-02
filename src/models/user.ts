import { ObjectType, Field, ID } from "type-graphql";

@ObjectType({ description: 'Data structure of a registered user.' })
class User {
  @Field(type => ID)
  id: number;

  @Field(type => String, { nullable: true })
  name?: string;

  @Field(type => String)
  email: string;

  @Field(type => String)
  role: keyof typeof Role;
}

enum Role { admin, user }

export default User