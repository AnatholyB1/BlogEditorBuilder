import useStore from "@/store";
import { Editor } from "@tiptap/vue-3";
import { clamp } from "@vueuse/core";
import { CSSProperties, nextTick, reactive } from "vue";
import { PixelAfterZoom, addPxToNumber, getNumberFromPx, getTextContent, kebabToCamelCase } from "./helpers";

export type styleProperty = keyof CSSProperties;

export interface BlockDataKey {
	key?: string;
	type?: string;
	property?: string;
}

function resetBlock(
	block: Block | BlockOptions,
	extendedFromComponent: string | undefined,
	children: Block[]
) {
	delete block.innerHTML;
	delete block.element;
	block.blockId = block.generateId();
	block.baseStyles = {};
	block.rawStyles = {};
	block.mobileStyles = {};
	block.tabletStyles = {};
	block.attributes = {};
	block.classes = [];
	block.children?.forEach((child, index) => {
		child.isChildOfComponent = extendedFromComponent;
		const componentChild = children[index];
		if (componentChild) {
			child.referenceBlockId = componentChild.blockId;
			resetBlock(child, extendedFromComponent, componentChild.children);
		}
	});
}

class Block implements BlockOptions {
	blockId: string;
	children: Array<Block>;
	baseStyles: BlockStyleMap;
	rawStyles: BlockStyleMap;
	mobileStyles: BlockStyleMap;
	tabletStyles: BlockStyleMap;
	attributes: BlockAttributeMap;
	classes: Array<string>;
	dataKey?: BlockDataKey | null = null;
	blockName?: string;
	element?: string;
	draggable?: boolean;
	innerText?: string;
	out: boolean = false;
	innerHTML?: string;
	extendedFromComponent?: string;
	originalElement?: string | undefined;
	isChildOfComponent?: string;
	referenceBlockId?: string;
	isRepeaterBlock?: boolean;
	gradient?: string;
	constructor(options: BlockOptions) {
		this.element = options.element;
		this.innerHTML = options.innerHTML;
		this.extendedFromComponent = options.extendedFromComponent;
		this.isRepeaterBlock = options.isRepeaterBlock;
		this.isChildOfComponent = options.isChildOfComponent;
		this.referenceBlockId = options.referenceBlockId;

		this.dataKey = options.dataKey || null;

		if (options.innerText) {
			this.innerHTML = options.innerText;
		}

		this.originalElement = options.originalElement;

		if (!options.blockId || options.blockId === "root") {
			this.blockId = this.generateId();
		} else {
			this.blockId = options.blockId;
		}
		this.children = (options.children || []).map((child: BlockOptions) => {
			return reactive(new Block(child));
		});

		this.baseStyles = reactive(options.styles || options.baseStyles || {});
		this.rawStyles = reactive(options.rawStyles || {});
		this.mobileStyles = reactive(options.mobileStyles || {});
		this.tabletStyles = reactive(options.tabletStyles || {});
		this.attributes = reactive(options.attributes || {});

		this.blockName = options.blockName;
		delete this.attributes.style;
		this.classes = options.classes || [];

		if (this.isText() && !this.classes.includes("__text_block__")) {
			this.classes.push("__text_block__");
		}

		const gr = this.baseStyles.background as string ?? '' ;
		if(gr.includes('gradient')) {
			this.gradient = gr.match(/linear|radial|conic/)![0] ;
		}

		if (this.isRoot()) {
			this.blockId = "root";
			this.draggable = false;
			this.setBaseStyle("minHeight", "100vh");
		}
	}
	setOut(out: boolean) {
		this.out = out;
	}
	isOut() {
		return this.out;
	}
	getStyles(breakpoint: string = "desktop") {
		let styleObj = {};
		if (this.isExtendedFromComponent()) {
			styleObj = this.getComponentStyles(breakpoint);
		}
		styleObj = { ...styleObj, ...this.baseStyles };
		if (breakpoint === "mobile") {
			styleObj = { ...styleObj, ...this.mobileStyles };
		} else if (breakpoint === "tablet") {
			styleObj = { ...styleObj, ...this.tabletStyles };
		}
		styleObj = { ...styleObj, ...this.rawStyles };
		return styleObj;
	}
	getComponent() {
		const store = useStore();
		if (this.extendedFromComponent) {
			return store.getComponentBlock(this.extendedFromComponent as string);
		}
		if (this.isChildOfComponent) {
			const componentBlock = store.getComponentBlock(this.isChildOfComponent as string);
			return (
				store.findBlock(this.referenceBlockId as string, [componentBlock]) ||
				store.findBlock(this.blockId as string, [componentBlock]) ||
				new Block({})
			);
		}
		return this;
	}
	getComponentStyles(breakpoint: string): BlockStyleMap {
		return this.getComponent()?.getStyles(breakpoint);
	}
	getAttributes(): BlockAttributeMap {
		let attributes = {};
		if (this.isExtendedFromComponent()) {
			attributes = this.getComponentAttributes();
		}
		attributes = { ...attributes, ...this.attributes };
		return attributes;
	}
	getComponentAttributes() {
		return this.getComponent()?.attributes || {};
	}
	getClasses() {
		let classes = [] as Array<string>;
		if (this.isExtendedFromComponent()) {
			classes = this.getComponentClasses();
		}
		classes = [...classes, ...this.classes];
		return classes;
	}
	getComponentClasses() {
		return this.getComponent()?.classes || [];
	}
	getChildren() {
		return this.children;
	}
	hasChildren() {
		return this.getChildren().length > 0;
	}
	getComponentChildren() {
		return this.getComponent()?.children || [];
	}

	getBlockDescription() {
		if (this.isExtendedFromComponent() && !this.isChildOfComponentBlock()) {
			return this.getComponentBlockDescription();
		}
		if (this.isHTML()) {
			return "raw";
		}
		let description = this.blockName || this.originalElement || this.getElement();
		if (this.getTextContent() && !this.blockName) {
			description += " | " + this.getTextContent();
		}
		return description;
	}
	getComponentBlockDescription() {
		const store = useStore();
		return store.getComponentName(this.extendedFromComponent as string);
	}
	getTextContent() {
		let editor = this.getEditor();
		let text = "";
		if (this.isText() && editor) {
			text = editor.getText();
		}
		return text || getTextContent(this.getInnerHTML() || "");
	}
	isImage() {
		return this.getElement() === "img";
	}
	isButton() {
		return this.getElement() === "button";
	}
	isLink() {
		return this.getElement() === "a";
	}
	isSVG() {
		return this.getElement() === "svg" || this.getInnerHTML()?.startsWith("<svg");
	}
	isText() {
		return ["span", "h1", "p", "b", "h2", "h3", "h4", "h5", "h6", "label", "a"].includes(
			this.getElement() as string
		);
	}
	isContainer() {
		return ["section", "div"].includes(this.getElement() as string);
	}
	isInput() {
		return this.originalElement === "input" || this.getElement() === "input";
	}
	setStyle(style: styleProperty, value: StyleValue) {
		const store = useStore();
		let styleObj = this.baseStyles;
		style = kebabToCamelCase(style) as styleProperty;
		if (store.activeBreakpoint === "mobile") {
			styleObj = this.mobileStyles;
		} else if (store.activeBreakpoint === "tablet") {
			styleObj = this.tabletStyles;
		}
		if (value === null || value === "") {
			delete styleObj[style];
			return;
		}
		styleObj[style] = value;
	}
	setAttribute(attribute: string, value: string) {
		this.attributes[attribute] = value;
	}
	getAttribute(attribute: string) {
		return this.getAttributes()[attribute];
	}
	removeStyle(style: styleProperty) {
		delete this.baseStyles[style];
		delete this.mobileStyles[style];
		delete this.tabletStyles[style];
	}
	setBaseStyle(style: styleProperty, value: StyleValue) {
		style = kebabToCamelCase(style) as styleProperty;
		this.baseStyles[style] = value;
	}
	getStyle(style: styleProperty) {
		const store = useStore();
		if (store.activeBreakpoint === "mobile") {
			return this.mobileStyles[style] || this.baseStyles[style];
		} else if (store.activeBreakpoint === "tablet") {
			return this.tabletStyles[style] || this.baseStyles[style];
		}
		return this.baseStyles[style];
	}
	generateId() {
		return Math.random().toString(36).substr(2, 9);
	}
	getIcon() {
		switch (true) {
			case this.isRoot():
				return "hash";
			case this.isRepeater():
				return "database";
			case this.isSVG():
				return "aperture";
			case this.isHTML():
				return "code";
			case this.isLink():
				return "link";
			case this.isText():
				return "type";
			case this.isContainer() && this.isRow():
				return "columns";
			case this.isContainer() && this.isColumn():
				return "credit-card";
			case this.isContainer():
				return "square";
			case this.isImage():
				return "image";

			default:
				return "square";
		}
	}
	isRoot() {
		return this.originalElement === "body";
	}
	isSection() {
		return this.getElement() === "section";
	}
	getTag(): string {
		if (this.isButton()) {
			return "div";
		}
		return this.getElement() || "div";
	}
	getComponentTag() {
		return this.getComponent()?.getTag() || "div";
	}
	isDiv() {
		return this.getElement() === "div";
	}
	getStylesCopy() {
		return {
			baseStyles: Object.assign({}, this.baseStyles),
			mobileStyles: Object.assign({}, this.mobileStyles),
			tabletStyles: Object.assign({}, this.tabletStyles),
		};
	}
	isHovered(): boolean {
		const store = useStore();
		return store.hoveredBlock === this.blockId;
	}
	isSelected(): boolean {
		const store = useStore();
		return store.selectedBlocks.some((block: Block) => block.blockId === this.blockId);
	}
	isMovable(): boolean {
		return this.getStyle("position") === "absolute";
	}
	freemove(x: number, y: number ) {
		const store = useStore();
		store.clearSelection();
		this.setStyle("left", addPxToNumber(x));
		this.setStyle("top", addPxToNumber(y));
	}
	move(direction: "up" | "left" | "down" | "right") {
		if (!this.isMovable()) {
			return;
		}
		let top = getNumberFromPx(this.getStyle("top")) || 0;
		let left = getNumberFromPx(this.getStyle("left")) || 0;
		if (direction === "up") {
			top -= 10;
			this.setStyle("top", addPxToNumber(top));
		} else if (direction === "down") {
			top += 10;
			this.setStyle("top", addPxToNumber(top));
		} else if (direction === "left") {
			left -= 10;
			this.setStyle("left", addPxToNumber(left));
		} else if (direction === "right") {
			left += 10;
			this.setStyle("left", addPxToNumber(left));
		}
	}
	addChild(child: BlockOptions, index?: number) {
		if (index === undefined) {
			index = this.children.length;
		}
		index = clamp(index, 0, this.children.length);

		const childBlock = reactive(new Block(child));
		this.children.splice(index, 0, childBlock);
		childBlock.selectBlock();
		if (childBlock.isText()) {
			childBlock.makeBlockEditable();
		}
		return childBlock;
	}
	setPosition(x: number, y: number) {
		this.setStyle("left", addPxToNumber(x));
		this.setStyle("top", addPxToNumber(y));
	}
	removeChild(child: Block) {
		const index = this.getChildIndex(child);
		if (index > -1) {
			this.children.splice(index, 1);
		}
	}
	getChildIndex(child: Block) {
		return this.children.findIndex((block) => block.blockId === child.blockId);
	}
	addChildAfter(child: BlockOptions, siblingBlock: Block) {
		const siblingIndex = this.getChildIndex(siblingBlock);
		return this.addChild(child, siblingIndex + 1);
	}
	getEditorStyles() {
		const styles = reactive({} as BlockStyleMap);

		if (this.isRoot()) {
			styles.width = "inherit";
			styles.overflowX = "hidden";
		}

		if (this.isImage() && !this.getAttribute("src")) {
			styles.background = `repeating-linear-gradient(45deg, rgba(180, 180, 180, 0.8) 0px, rgba(180, 180, 180, 0.8) 1px, rgba(255, 255, 255, 0.2) 0px, rgba(255, 255, 255, 0.2) 50%)`;
			styles.backgroundSize = "16px 16px";
		}

		if (this.isButton() && this.children.length === 0) {
			styles.display = "flex";
			styles.alignItems = "center";
			styles.justifyContent = "center";
		}

		return styles;
	}
	selectBlock() {
		const store = useStore();
		store.selectedBlocks = [this];
	}
	toggleSelectBlock() {
		const store = useStore();
		if (this.isSelected()) {
			store.selectedBlocks = store.selectedBlocks.filter((block: Block) => block.blockId !== this.blockId);
		} else {
			store.selectedBlocks.push(this);
		}
	}
	getParentBlock(): Block | null {
		const store = useStore();
		return store.findParentBlock(this.blockId);
	}
	canHaveChildren(): boolean {
		return this.isContainer() || this.isRoot() || this.isDiv();
	}
	updateStyles(styles: BlockStyleObjects) {
		this.baseStyles = Object.assign({}, this.baseStyles, styles.baseStyles);
		this.mobileStyles = Object.assign({}, this.mobileStyles, styles.mobileStyles);
		this.tabletStyles = Object.assign({}, this.tabletStyles, styles.tabletStyles);
	}
	getBackgroundColor() {
		return this.getStyle("backgroundColor") || "transparent";
	}
	getPosition() {
		return {x : this.getStyle("left"), y : this.getStyle("top")};
	}
	getSize() {
		return {width : this.getStyle("width"), height : this.getStyle("height")};
	}
	getRealSize() {
		
		const element = document.querySelector(`[data-block-id="${this.blockId}"]`);
		if(!element) return {width : 0, height : 0};
		return {width : PixelAfterZoom( element.clientWidth), height : PixelAfterZoom(element.clientHeight)};
	}
	getFontFamily() {
		const editor = this.getEditor();
		if (this.isText() && editor && editor.isEditable) {
			return editor.getAttributes("textStyle").fontFamily;
		}
		return this.getStyle("fontFamily");
	}
	setFontFamily(fontFamily: string) {
		const editor = this.getEditor();
		if (this.isText() && editor && editor.isEditable) {
			editor.chain().focus().setFontFamily(fontFamily).run();
		} else {
			this.setStyle("fontFamily", fontFamily);
		}
	}
	getTextColor() {
		const editor = this.getEditor();
		if (this.isText() && editor && editor.isEditable) {
			return editor.getAttributes("textStyle").color;
		} else {
			return this.getStyle("color");
		}
	}
	getEditor(): null | Editor {
		return null;
	}
	setTextColor(color: string) {
		const editor = this.getEditor();
		if (this.isText() && editor && editor.isEditable) {
			editor.chain().focus().setColor(color).run();
		} else {
			this.setStyle("color", color);
		}
	}
	isHTML() {
		return this.originalElement === "__raw_html__";
	}
	makeBlockEditable() {
		const store = useStore();
		this.selectBlock();
		store.builderState.editableBlock = this;
		nextTick(() => {
			this.getEditor()?.commands.focus("all");
		});
	}
	isExtendedFromComponent() {
		return Boolean(this.extendedFromComponent) || Boolean(this.isChildOfComponent);
	}
	convertToRepeater() {
		this.setBaseStyle("display", "flex");
		this.setBaseStyle("flexDirection", "column");
		this.setBaseStyle("alignItems", "flex-start");
		this.setBaseStyle("justifyContent", "flex-start");
		this.setBaseStyle("flexWrap", "wrap");
		this.setBaseStyle("width", "fit-content");
		this.setBaseStyle("height", "fit-content");
		this.setBaseStyle("gap", "20px");
		this.isRepeaterBlock = true;
	}
	moveChild(child: Block, index: number) {
		const childIndex = this.children.findIndex((block) => block.blockId === child.blockId);
		if (childIndex > -1) {
			this.children.splice(childIndex, 1);
			this.children.splice(index, 0, child);
		}
	}
	isRepeater() {
		return this.isRepeaterBlock;
	}
	getDataKey(key: keyof BlockDataKey): string {
		let dataKey = (this.dataKey && this.dataKey[key]) || "";
		if (!dataKey && this.isExtendedFromComponent()) {
			dataKey = this.getComponent()?.getDataKey(key);
		}
		return dataKey;
	}
	setDataKey(key: keyof BlockDataKey, value: string) {
		if (!this.dataKey) {
			this.dataKey = {
				key: "",
				type: this.isImage() || this.isLink() ? "attribute" : "key",
				property: this.isLink() ? "href" : this.isImage() ? "src" : "innerHTML",
			};
		}
		this.dataKey[key] = value;
	}
	getInnerHTML(): string {
		let innerHTML = this.innerHTML || "";
		if (!innerHTML && this.isExtendedFromComponent()) {
			innerHTML = this.getComponent().getInnerHTML();
		}
		return innerHTML;
	}
	setInnerHTML(innerHTML: string) {
		this.innerHTML = innerHTML;
	}
	getGradient() {
		return this.gradient;
	}
	setGradient(gradient: string | undefined) {
		this.gradient = gradient;
	}
	toggleVisibility() {
		if (this.getStyle("display") === "none") {
			this.setStyle("display", "block");
		} else {
			this.setStyle("display", "none");
		}
	}
	isVisible() {
		return this.getStyle("display") !== "none";
	}
	extendFromComponent(componentName: string) {
		this.extendedFromComponent = componentName;
		this.resetChanges();
	}
	isChildOfComponentBlock() {
		return Boolean(this.isChildOfComponent);
	}
	resetChanges() {
		// resetBlock(this, this.extendedFromComponent);
		const component = this.getComponent();
		resetBlock(this, this.extendedFromComponent, component.children);
	}
	convertToLink() {
		this.element = "a";
		this.attributes.href = "#";
	}
	getElement() {
		if (this.isExtendedFromComponent()) {
			return this.getComponent()?.element || "div";
		}
		return this.element;
	}
	getUsedComponentNames() {
		const store = useStore();
		const componentNames = [] as string[];
		if (this.extendedFromComponent) {
			componentNames.push(this.extendedFromComponent);
		}
		if (this.isChildOfComponent) {
			componentNames.push(this.isChildOfComponent);
		}
		this.children.forEach((child) => {
			componentNames.push(...child.getUsedComponentNames());
		});

		componentNames.forEach((name) => {
			componentNames.push(...store.getComponentBlock(name).getUsedComponentNames());
		});

		return new Set(componentNames);
	}
	isFlex() {
		return this.getStyle("display") === "flex";
	}
	isRow() {
		return this.isFlex() && this.getStyle("flexDirection") === "row";
	}
	isColumn() {
		return this.isFlex() && this.getStyle("flexDirection") === "column";
	}
	duplicateBlock() {
		const store = useStore();
		store.history.pause();
		const blockCopy = store.getBlockCopy(this);
		const parentBlock = this.getParentBlock();

		if (blockCopy.getStyle("position") === "absolute") {
			// shift the block a bit
			const left = getNumberFromPx(blockCopy.getStyle("left"));
			const top = getNumberFromPx(blockCopy.getStyle("top"));
			blockCopy.setStyle("left", `${left + 20}px`);
			blockCopy.setStyle("top", `${top + 20}px`);
		}

		let child = null as Block | null;
		if (parentBlock) {
			child = parentBlock.addChildAfter(blockCopy, this);
		} else {
			child = store.builderState.blocks[0]?.addChild(blockCopy);
		}
		nextTick(() => {
			if (child) {
				child.selectBlock();
			}
			store.history.resume();
			store.history.commit();
		});
	}
	getPadding() {
		const padding = this.getStyle("padding") || "0px";

		const paddingTop = this.getStyle("paddingTop");
		const paddingBottom = this.getStyle("paddingBottom");
		const paddingLeft = this.getStyle("paddingLeft");
		const paddingRight = this.getStyle("paddingRight");

		if (!paddingTop && !paddingBottom && !paddingLeft && !paddingRight) {
			return padding;
		}

		if (
			paddingTop &&
			paddingBottom &&
			paddingTop === paddingBottom &&
			paddingTop === paddingRight &&
			paddingTop === paddingLeft
		) {
			return paddingTop;
		}

		if (paddingTop && paddingLeft && paddingTop === paddingBottom && paddingLeft === paddingRight) {
			return `${paddingTop} ${paddingLeft}`;
		} else {
			return `${paddingTop || padding} ${paddingRight || padding} ${paddingBottom || padding} ${
				paddingLeft || padding
			}`;
		}
	}
	setPadding(padding: string) {
		// reset padding
		this.removeStyle("padding");
		this.removeStyle("paddingTop");
		this.removeStyle("paddingBottom");
		this.removeStyle("paddingLeft");
		this.removeStyle("paddingRight");

		if (!padding) {
			return;
		}

		const paddingArray = padding.split(" ");

		if (paddingArray.length === 1) {
			this.setStyle("padding", paddingArray[0]);
		} else if (paddingArray.length === 2) {
			this.setStyle("paddingTop", paddingArray[0]);
			this.setStyle("paddingBottom", paddingArray[0]);
			this.setStyle("paddingLeft", paddingArray[1]);
			this.setStyle("paddingRight", paddingArray[1]);
		} else if (paddingArray.length === 3) {
			this.setStyle("paddingTop", paddingArray[0]);
			this.setStyle("paddingLeft", paddingArray[1]);
			this.setStyle("paddingRight", paddingArray[1]);
			this.setStyle("paddingBottom", paddingArray[2]);
		} else if (paddingArray.length === 4) {
			this.setStyle("paddingTop", paddingArray[0]);
			this.setStyle("paddingRight", paddingArray[1]);
			this.setStyle("paddingBottom", paddingArray[2]);
			this.setStyle("paddingLeft", paddingArray[3]);
		}
	}
	setMargin(margin: string) {
		// reset margin
		this.removeStyle("margin");
		this.removeStyle("marginTop");
		this.removeStyle("marginBottom");
		this.removeStyle("marginLeft");
		this.removeStyle("marginRight");

		if (!margin) {
			return;
		}

		const marginArray = margin.split(" ");

		if (marginArray.length === 1) {
			this.setStyle("margin", marginArray[0]);
		} else if (marginArray.length === 2) {
			this.setStyle("marginTop", marginArray[0]);
			this.setStyle("marginBottom", marginArray[0]);
			this.setStyle("marginLeft", marginArray[1]);
			this.setStyle("marginRight", marginArray[1]);
		} else if (marginArray.length === 3) {
			this.setStyle("marginTop", marginArray[0]);
			this.setStyle("marginLeft", marginArray[1]);
			this.setStyle("marginRight", marginArray[1]);
			this.setStyle("marginBottom", marginArray[2]);
		} else if (marginArray.length === 4) {
			this.setStyle("marginTop", marginArray[0]);
			this.setStyle("marginRight", marginArray[1]);
			this.setStyle("marginBottom", marginArray[2]);
			this.setStyle("marginLeft", marginArray[3]);
		}
	}
	getMargin() {
		const margin = this.getStyle("margin") || "0px";

		const marginTop = this.getStyle("marginTop");
		const marginBottom = this.getStyle("marginBottom");
		const marginLeft = this.getStyle("marginLeft");
		const marginRight = this.getStyle("marginRight");

		if (!marginTop && !marginBottom && !marginLeft && !marginRight) {
			return margin;
		}

		if (
			marginTop &&
			marginBottom &&
			marginTop === marginBottom &&
			marginTop === marginRight &&
			marginTop === marginLeft
		) {
			return marginTop;
		}

		if (marginTop && marginLeft && marginTop === marginBottom && marginLeft === marginRight) {
			return `${marginTop} ${marginLeft}`;
		} else {
			return `${marginTop || margin} ${marginRight || margin} ${marginBottom || margin} ${
				marginLeft || margin
			}`;
		}
	}
}

// class BlockTree {
// 	blocksMap: Map<string, Block>;
// 	constructor() {
// 		this.blocksMap = new Map();
// 	}

// 	buildBlockMap(blocks: Array<Block>) {
// 		for (const block of blocks) {
// 			for (const child of block.children) {
// 				this.blocksMap.set(child.blockId, block);
// 				this.buildBlockMap(child.children);
// 			}
// 		}
// 	}

// 	findParentBlock(blockId: string) {
// 		return this.blocksMap.get(blockId) || null;
// 	}
// }

export default Block;
