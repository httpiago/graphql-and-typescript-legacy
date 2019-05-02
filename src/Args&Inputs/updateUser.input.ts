import { InputType, Field, registerEnumType } from "type-graphql";
import { Length, IsEmail } from "class-validator";
import User from "../models/user";

@InputType({ description: 'Update user data.' })
class UpdateUserInput implements Partial<User> {
  @Field({ nullable: true })
  @Length(0, 255)
  name?: string;

  @Field({ nullable: true })
  @Length(0, 255)
  @IsEmail()
  email?: string;

  @Field(type => Role, { nullable: true })
  role?: keyof typeof Role;
}

export enum Role { admin, writer, reader }
registerEnumType(Role, {
  name: "Role",
  description: "The role of user for authorization.",
})

export default UpdateUserInput