import { cache } from "react";
import { commerce } from "./provider";
export const getCollections = cache(() => commerce.getCollections());
