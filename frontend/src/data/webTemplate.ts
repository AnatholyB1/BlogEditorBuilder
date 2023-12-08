import { createListResource } from "frappe-ui";
import { BuilderTemplate } from "@/types/Builder/BuilderTemplate";


const getTag = async(filter : string) => {
	const tagTemplate = createListResource({
		method: "GET",
		doctype: "Builder Tag Map",
		fields: ["*"],
		parent: "Builder template",
		orderBy: "creation",
		cache: "Tags",
		start: 0,
		pageLength: 100,
		auto: false,
		transform(data: any[]) {
			return data;
		},
	});
	tagTemplate.update(
		{
			filters: [
				[ "parent", "=", filter],
			],
		},
	);
	tagTemplate.fetch();
	return await tagTemplate.list.promise;
}

const getSection = async(filter : string) => {
	const sectionTemplate = createListResource({
		method: "GET",
		doctype: "Builder Component Map",
		fields: ["*"],
		parent: "Builder template",
		orderBy: "creation",
		cache: "Sections",
		start: 0,
		pageLength: 100,
		auto: false,
		transform(data: any[]) {
			return data;
		},
	});
	sectionTemplate.update(
		{
			filters: [
				[ "parent", "=", filter],
			],
		},
	);
	sectionTemplate.fetch();
	return await sectionTemplate.list.promise;
}


const webTemplate = createListResource({
	method: "GET",
	doctype: "Builder template",
	fields: ["*"],
	orderBy: "creation",
	cache: "Templates",
	start: 0,
	pageLength: 100,
	auto: true,
	transform: async (data: BuilderTemplate[]) => {
		await Promise.all(data.map(async (d) => {
			d.tags = await getTag(d.name as string);
			d.section = await getSection(d.name as string);
		}));
		return data;
	},
}) ;


export default webTemplate;
