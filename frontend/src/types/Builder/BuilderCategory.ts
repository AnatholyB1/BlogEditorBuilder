export interface BuilderCategory {
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
	/**	Component Name : Data	*/
	category_name?: string;
	/**	Component ID : Data	*/
	category_id?: string;
}
