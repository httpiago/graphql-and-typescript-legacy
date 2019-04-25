import { ArgsType, Field } from "type-graphql";
import { Min, Max } from "class-validator";

@ArgsType()
class PaginationArgs {
  @Field({ nullable: true, defaultValue: 10 })
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @Field({ nullable: true, defaultValue: 0 })
  @Min(0)
  offset?: number = 0;
}

export default PaginationArgs