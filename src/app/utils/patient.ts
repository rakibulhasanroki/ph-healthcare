import { isValid, parse } from "date-fns";

export const convertDateTime = (dateString: string | undefined) => {
  if (dateString) {
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    return isValid(date) ? date : undefined;
  } else {
    return undefined;
  }
};
