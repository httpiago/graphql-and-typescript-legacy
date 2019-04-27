import { ArgsType, Field } from "type-graphql";
import { Min, Max, IsNumber } from "class-validator";

const maxSize = 50

@ArgsType()
class PaginationArgs {
  @Field({ nullable: true, defaultValue: 10, description: 'Returns the first n elements from the list.' })
  @IsNumber()
  @Min(1)
  @Max(maxSize)
  first?: number = 10;

  @Field({ nullable: true, defaultValue: 0, description: 'Number of elements to skip for offset-based pagination.' })
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @Field({ nullable: true, description: 'Returns the elements in the list that come after the specified cursor.' })
  after?: string;
}

export default PaginationArgs