declare type StyleValue = string | number | null | undefined;

declare interface BlockStyleMap {
	[key: string]: StyleValue;
}

declare interface BlockAttributeMap {
	[key: string]: string;
}

declare interface BlockOptions {
	blockId?: string | undefined;
	element?: string;
	originalElement?: string;
	baseStyles?: BlockStyleMap;
	mobileStyles?: BlockStyleMap;
	tabletStyles?: BlockStyleMap;
	attributes?: BlockAttributeMap;
	classes?: Array<string>;
	children?: Array<Block | BlockOptions>;
	draggable?: boolean;
	[key: string]: any;
}

declare interface BlockComponent {
	name: string;
	component_name: string;
	icon: string;
	is_dynamic: boolean;
	block: BlockOptions;
	scale: number;
}

declare interface BlockCategory {
	name: string;
	category_name: string;
}

declare interface PageMap {
	[key: string]: Page;
}

declare interface BlockStyleObjects {
	baseStyles: BlockStyleMap;
	mobileStyles?: BlockStyleMap;
	tabletStyles?: BlockStyleMap;
}

declare interface StyleCopy {
	blockId: string;
	style: BlockStyleObjects;
}

declare interface ContextMenuOption {
	label: string;
	action: CallableFunction;
	condition?: () => boolean;
}

declare interface ComponentData {
	name: string;
	doctype?: string;
	isDynamic: boolean;
	mappings?: {
		[key: string]: string;
	};
}

declare type HashString = `#${string}`;
declare type gradiantString = `linear-gradient(180deg, ${HashString} 9.14%, ${HashString} 80.16%)` | `radial-gradient(56.34% 56.34% at 50% 50%, ${HashString} 26.56%, ${HashString} 100%)` | `conic-gradient(from 180deg at 50% 50%, ${HashString} 95.625deg, ${HashString} 360deg)` | HashString;
declare type RGBString = `rgb(${number}, ${number}, ${number}, ${number})`;

declare type LeftSidebarTabOption = "templates" | "layers" | "components" | "ia" | "question"
declare type RightSidebarTabOption = "Properties" | "Data" | "Settings";
declare type RightSidebarSimpleTabOption = 'Edit' | 'Style';

declare type BuilderMode = "select" | "text" | "container" | "image" | "html" | "section";

declare interface CanvasProps {
	scale: number;
	translateX: number;
	translateY: number;
	scaling: boolean;
	panning: boolean;
	background: string;
	settingCanvas: boolean;
	overlayElement: HTMLElement | null;
}

declare type EditingMode = "page" | "component";

declare interface Category {name : string, Icon : Icon, focus: string} 
