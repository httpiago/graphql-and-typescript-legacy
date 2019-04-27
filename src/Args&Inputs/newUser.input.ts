import { InputType, Field } from "type-graphql";
import { Length, IsEmail } from "class-validator";
import User from "../models/user";

@InputType({ description: 'New user data.' })
class NewUserInput implements Partial<User> {
  @Field()
  @Length(0, 255)
  name: string;

  @Field()
  @Length(0, 255)
  @IsEmail()
  email: string;
}

export default NewUserInput