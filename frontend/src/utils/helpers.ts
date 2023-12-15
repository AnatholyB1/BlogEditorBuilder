function getNumberFromPx(px: string | number | null | undefined): number {
	if (!px) {
		return 0;
	}
	if (typeof px === "number") {
		return px;
	}
	return Number(px.replace("px", ""));
}

function addPxToNumber(number: number, round: boolean = true): string {
	number = round ? Math.round(number) : number;
	return `${number}px`;
}

function HexToHSV(color: HashString): { h: number; s: number; v: number, a:number } {
	const [r, g, b, a] = color
		.replace("#", "")
		.match(/.{1,2}/g)
		?.map((x) => parseInt(x, 16)) || [0, 0, 0,1];

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const v = max / 255;
	const d = max - min;
	const s = max === 0 ? 0 : d / max;
	const h =
		max === min
			? 0
			: max === r
			? (g - b) / d + (g < b ? 6 : 0)
			: max === g
			? (b - r) / d + 2
			: (r - g) / d + 4;
	const alpha = a / 255;
	return { h: h * 60, s, v, a:alpha };
}

function HSVToHex(h: number, s: number, v: number, a?:number): HashString {
	s /= 100;
	v /= 100;
	h /= 360;
	a = a === undefined ? 1 : a;

	let r = 0,
		g = 0,
		b = 0;

	let i = Math.floor(h * 6);
	let f = h * 6 - i;
	let p = v * (1 - s);
	let q = v * (1 - f * s);
	let t = v * (1 - (1 - f) * s);

	switch (i % 6) {
		case 0:
			(r = v), (g = t), (b = p);
			break;
		case 1:
			(r = q), (g = v), (b = p);
			break;
		case 2:
			(r = p), (g = v), (b = t);
			break;
		case 3:
			(r = p), (g = q), (b = v);
			break;
		case 4:
			(r = t), (g = p), (b = v);
			break;
		case 5:
			(r = v), (g = p), (b = q);
			break;
	}
	r = Math.round(r * 255);
	g = Math.round(g * 255);
	b = Math.round(b * 255);
	a = Math.round(a * 255);
	return `#${[r, g, b, a].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function getRandomColor() {
	return HSVToHex(Math.random() * 360, 25, 100,1);
}

async function confirm(message: string): Promise<boolean> {
	return new Promise((resolve) => {
		const confirmed = window.confirm(message);
		resolve(confirmed);
	});
}

function getTextContent(html: string | null) {
	if (!html || !isHTMLString(html)) {
		return html || "";
	}
	const tmp = document.createElement("div");
	tmp.innerHTML = html || "";
	const textContent = tmp.textContent || tmp.innerText || "";
	tmp.remove();
	return textContent;
}

function RGBToHex(rgb: RGBString ): HashString {
	const [r, g, b,a] = rgb
		.replace("rgba(", "")
		.replace(")", "")
		.split(",")
		.map((x) => parseInt(x));
	return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
}


function getRGB(color: HashString | RGBString | string | null): HashString | null {
	if (!color) {
		return null;
	}
	if(color.startsWith("#"))color = color.replace("#", "");
	if (color.startsWith("rgba")) {
		return RGBToHex(color as RGBString);
	} else if (!color.startsWith("#") && color.match(/\b[a-fA-F0-9]{3,8}\b/g)) {
		if(color.length == 3)
		{
			return `#${color[0]}${color[0]}${color[1]}${color[1]}${color[2]}${color[2]}FF` as HashString;
		}if(color.length == 6)
		{
			return `#${color}FF` as HashString;
		}
		return `#${color}` as HashString;
	}
	return '#FFFFFFFF' as HashString;
}

function updateOpacityInHex(color: HashString, opacity: number) {
	if (color.startsWith("#") && color.match(/\b[a-fA-F0-9]{3,9}\b/g)) {
		return color.slice(0,7) + Math.round(opacity * 255).toString(16).padStart(2, "0");
	}
	return color;
}

function validateColor(color: string) {
	const regex = /^#?([A-Fa-f0-9]{0,8})$/;
	return regex.test(color);
}

function validateOpacity(opacity: string) {
	const regex = /^(100|[1-9]?[0-9])$/;
	return regex.test(opacity);
}

function getFirstColorFromGradient(gradient : string, all : boolean = false) {
	if(!gradient)return '#FFFFFFFF';
	if(!gradient.includes('gradient'))return null;
    const match = gradient.match(/#[a-fA-F0-9]{8}/);
    return match ? match[0] : null;
}
function isColorDark(hexColor : string) {
	if(!hexColor)return false;
	hexColor.replace("#", "");
    const rgb = parseInt(hexColor.slice(1), 16);   // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff;  // extract red
    const g = (rgb >>  8) & 0xff;  // extract green
    const b = (rgb >>  0) & 0xff;  // extract blue

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    return luma < 128;
}

function getAllColorsFromGradient(gradient : string) {
	const match = gradient.match(/#[a-fA-F0-9]{3,8}/g);
	return match ? match : null;
}

function getGradientType(gradient : string) {
	const match = gradient.match(/linear|radial|conic/);
	return match ? match[0] : null;
}

function replaceColorsInGradient(gradient : string, colors : string[]) {
	const allColors = getAllColorsFromGradient(gradient);
    if (allColors && allColors.length ==  colors.length) {
        gradient = gradient.replace(allColors[0], colors[0]);
        gradient = gradient.replace(allColors[1], colors[1]);
    }
    return gradient;
}

function getOpacity(color: HashString | RGBString | string | null): number {
	if (!color) {
		return 1;
	}
	if (color.startsWith("rgba")) {
		return Number(Number(color.replace("rgba(", "").replace(")", "").split(",")[3]).toFixed(2));
	} else if (!color.startsWith("#") && color.match(/\b[a-fA-F0-9]{3,6}\b/g)) {
		return 1;
	}
	else if (color.startsWith("#") && color.length === 9) {
		return Number((parseInt(color.slice(7, 9), 16) / 255).toFixed(2));
	}else if (color.startsWith("l")) {
		return Number((parseInt(getFirstColorFromGradient(color)!.slice(7, 9), 16) / 255).toFixed(2));
	}
	return 1;
}

function isHTMLString(str: string) {
	return /<[a-z][\s\S]*>/i.test(str);
}

function copyToClipboard(text: string | object, e: ClipboardEvent, copyFormat = "text/plain") {
	if (typeof text !== "string") {
		text = JSON.stringify(text);
	}
	e.clipboardData?.setData(copyFormat, text);
}

function stripExtension(string: string) {
	const lastDotPosition = string.lastIndexOf(".");
	if (lastDotPosition === -1) {
		return string;
	}
	return string.substr(0, lastDotPosition);
}

function findNearestSiblingIndex(e: MouseEvent) {
	let nearestElementIndex = 0;
	let minDistance = Number.MAX_VALUE;
	let parent = e.target as HTMLElement;

	const elements = Array.from(parent.children);
	elements.forEach(function (element, index) {
		const rect = element.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const distance = Math.sqrt(Math.pow(centerX - e.clientX, 2) + Math.pow(centerY - e.clientY, 2));
		if (distance < minDistance) {
			minDistance = distance;
			nearestElementIndex = index;
			const positionBitmask = element.compareDocumentPosition(e.target as Node);
			// sourcery skip: possible-incorrect-bitwise-operator
			if (positionBitmask & Node.DOCUMENT_POSITION_PRECEDING) {
				// before
			} else {
				nearestElementIndex += 1;
			}
		}
	});
	return nearestElementIndex;
}

// converts border-color to borderColor
function kebabToCamelCase(str: string) {
	return str.replace(/-([a-z])/g, function (g) {
		return g[1].toUpperCase();
	});
}

function isJSONString(str: string) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

function isTargetEditable(e: Event) {
	const target = e.target as HTMLElement;
	const isEditable = target.isContentEditable;
	const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
	return isEditable || isInput;
}
function getDataForKey(datum: Object, key: string) {
	const data = Object.assign({}, datum);
	return key.split(".").reduce((d, key) => (d ? d[key ] : null), data) as string;
}

export {
	validateColor,
	validateOpacity,
	isColorDark,
	getGradientType,
	getAllColorsFromGradient,
	replaceColorsInGradient,
	getFirstColorFromGradient,
	updateOpacityInHex,
	getOpacity,
	HSVToHex,
	HexToHSV,
	RGBToHex,
	addPxToNumber,
	confirm,
	copyToClipboard,
	findNearestSiblingIndex,
	getDataForKey,
	getNumberFromPx,
	getRGB,
	getRandomColor,
	getTextContent,
	isHTMLString,
	isJSONString,
	isTargetEditable,
	kebabToCamelCase,
	stripExtension,
};
