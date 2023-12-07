import { createListResource } from "frappe-ui";

import { BuilderCategory } from "@/types/Builder/BuilderCategory";

const WebCategory = createListResource({
	method: "GET",
	doctype: "Builder Category",
	fields: [ "name","category_name", "category_id"],
	orderBy: "creation",
	cache: "categories",
	start: 0,
	pageLength: 100,
	auto: true,
});

export default WebCategory;
