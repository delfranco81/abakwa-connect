import { ai } from "./ai";
import { business } from "./business";
import { identity } from "./identity";
import { jobs } from "./jobs";
import { notifications } from "./notifications";

import {
  searchEverydayConnect,
} from "../core/search/SearchEngine";

export const search = {
  query(
    query: string,
    page = 1
  ) {
    return searchEverydayConnect(
      query,
      page
    );
  },
};

export const ECOS = {
  ai,
  business,
  identity,
  jobs,
  notifications,
  search,
};

export default ECOS;
