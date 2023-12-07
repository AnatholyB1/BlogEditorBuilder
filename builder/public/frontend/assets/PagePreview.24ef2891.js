var N=Object.defineProperty;var E=Object.getOwnPropertySymbols;var S=Object.prototype.hasOwnProperty,V=Object.prototype.propertyIsEnumerable;var C=(r,s,t)=>s in r?N(r,s,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[s]=t,P=(r,s)=>{for(var t in s||(s={}))S.call(s,t)&&C(r,t,s[t]);if(E)for(var t of E(s))V.call(s,t)&&C(r,t,s[t]);return r};import{q as F,ct as $,s as c,u as M,bP as q,bn as T,bm as O,r as y,o as m,d as v,b as p,j as l,w,l as L,x as f,F as U,e as A,t as G,p as W,f as H,cy as J,h as B,bN as K}from"./index.b08d9d08.js";import{_ as I}from"./PanelResizer.vue_vue_type_script_setup_true_lang.ddb3319a.js";import{u as Q}from"./store.70b8d965.js";import"./fileUploadHandler.7bd6d646.js";const X={class:"flex h-screen flex-col items-center bg-gray-100 p-5 dark:bg-zinc-900"},Y={class:"relative flex w-full items-center justify-center"},Z={class:"flex gap-1 text-gray-500 dark:bg-zinc-900 dark:text-zinc-500"},ee=["onClick"],te=p("div",{class:"resize-handler-left h-full w-2 rounded-sm bg-gray-200 dark:bg-zinc-600"},null,-1),se=["src"],ae={key:1,class:"absolute flex h-full w-full flex-1 items-center justify-center bg-white bg-opacity-50 text-gray-600"},ie=p("div",{class:"resize-handler-left h-full w-2 rounded-sm bg-gray-200 dark:bg-zinc-600"},null,-1),k=400,ue=F({__name:"PagePreview",setup(r){const s=$(),t=window.innerWidth*.92;let _=c("");const n=c(t),b=c(!1),x=Q(),h=c(!1),{deviceBreakpoints:g}=x,z=M(()=>{const a=g.find(i=>i.device==="tablet"),e=g.find(i=>i.device==="mobile");return n.value<=((e==null?void 0:e.width)||k)?"mobile":n.value<=((a==null?void 0:a.width)||t)?"tablet":"desktop"}),d=c(null);q(document,"keydown",a=>{a.key==="Escape"&&J.currentRoute.value.name==="preview"&&history.back()}),T(()=>{d.value&&(b.value=!0,d.value.addEventListener("load",()=>{var a,e,i;setTimeout(()=>{b.value=!1},100),(a=d.value)==null||a.addEventListener("mousedown",u=>{document.dispatchEvent(new MouseEvent("mousedown",u))}),(i=(e=d.value)==null?void 0:e.contentWindow)==null||i.document.addEventListener("mouseup",u=>{document.dispatchEvent(new MouseEvent("mouseup",u))})}))});const R=a=>{const e=g.find(i=>i.device===a);e&&(e.device==="desktop"?n.value=t:n.value=e.width)},j=()=>{let a=P({page:s.params.pageId},x.routeVariables);_.value=`/api/method/builder.builder.doctype.builder_page.builder_page.get_page_preview_html?${Object.entries(a).map(([e,i])=>`${e}=${i}`).join("&")}`};return O(()=>s.params.pageId,()=>{j()},{immediate:!0}),(a,e)=>{const i=y("FeatherIcon"),u=y("router-link"),D=y("Button");return m(),v("div",X,[p("div",Y,[l(u,{to:{name:"builder",params:{pageId:f(s).params.pageId||"new"}},class:"absolute left-5 flex w-fit text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-100"},{default:w(()=>[l(i,{name:"arrow-left",class:"mr-4 h-4 w-4 cursor-pointer"}),L(" Back to builder ")]),_:1},8,["to"]),p("div",Z,[(m(!0),v(U,null,A(f(g),o=>(m(),v("div",{class:B(["w-auto cursor-pointer rounded-md p-1 px-[8px]",{"bg-white shadow-sm dark:bg-zinc-700":z.value===o.device}]),key:o.device,onClick:K(()=>R(o.device),["stop"])},[l(i,{name:o.icon,class:B(["h-6 w-5",{"text-gray-700   dark:text-zinc-50":z.value===o.device}])},null,8,["name","class"])],10,ee))),128))]),l(D,{variant:"solid",onClick:e[0]||(e[0]=()=>{h.value=!0,f(x).publishPage().finally(()=>h.value=!1)}),class:"absolute right-0 border-0 text-xs dark:bg-zinc-800",loading:h.value},{default:w(()=>[L(G(h.value?"Publishing":"Publish"),1)]),_:1},8,["loading"])]),p("div",{class:"relative mt-5 flex h-[85vh] bg-white",style:H({width:n.value+"px"})},[l(I,{class:"ml-[-12px]",side:"left",dimension:n.value,minDimension:k,maxDimension:t,resizeSensitivity:2,onResize:e[1]||(e[1]=o=>n.value=o)},{default:w(()=>[te]),_:1},8,["dimension"]),f(_)?(m(),v("iframe",{key:0,src:f(_),frameborder:"0",class:"flex-1 rounded-sm",ref_key:"previewWindow",ref:d},null,8,se)):W("",!0),b.value?(m(),v("div",ae," Loading... ")):W("",!0),l(I,{class:"mr-[-8px]",side:"right",dimension:n.value,minDimension:k,maxDimension:t,resizeSensitivity:2,onResize:e[2]||(e[2]=o=>n.value=o)},{default:w(()=>[ie]),_:1},8,["dimension"])],4)])}}});export{ue as default};
//# sourceMappingURL=PagePreview.24ef2891.js.map
