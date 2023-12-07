import { createListResource } from "frappe-ui";


const webTemplate = createListResource({
	method: "GET",
	doctype: "Builder template",
	fields: ["*"],
	orderBy: "creation",
	cache: "Templates",
	start: 0,
	pageLength: 100,
	auto: true,
	transform(data: any[]) {
		data.forEach((d) => {
			console.log(d);
		});
		return data;
	},
});

export default webTemplate;
