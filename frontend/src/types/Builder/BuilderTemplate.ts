export interface BuilderTemplate {
	creation: string;
	name: string;
	modified: string;
	owner: string;
	modified_by: string;
	docstatus: 0 | 1 | 2;
	parent?: string;
	parentfield?: string;
	parenttype?: string;
	idx?: number;
	/**	template Name : Data	*/
	template_name?: string;
	/**	template ID : Data	*/
	template_id?: string;
	/**	template tag : string	*/
	tags?: any;
	/**	template section : string	*/
	section?: any;
	/**	template icon : string	*/
	template_icon?: string;
}
