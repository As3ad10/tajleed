<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { ar as t } from '../lib/i18n/messages';
  import { calculateGeometry, effectiveSpine } from '../lib/cover/geometry';
  import { defaultSpec, duplicateProject, newProject } from '../lib/cover/project';
  import { parseLocalizedNumber, formatMm } from '../lib/cover/numbers';
  import { svgMarkup } from '../lib/cover/render';
  import { validateProject } from '../lib/cover/validation';
  import { parseProjectFile } from '../lib/cover/schema';
  import { deleteProject, lastProjectId, listProjects, saveProject } from '../lib/cover/storage';
  import type { Construction, CoverProject, CoverSpec, Opening } from '../lib/cover/types';

  let project = $state<CoverProject>(newProject());
  let previewProject = $state<CoverProject>(newProject());
  let projects = $state<CoverProject[]>([]);
  let drafts = $state<Record<string,string>>({});
  let draftErrors = $state<Record<string,string>>({});
  let ready = $state(false);
  let saveState = $state<'saved'|'saving'|'error'>('saving');
  let exportOpen = $state(false);
  let exportBusy = $state(false);
  let exportError = $state('');
  let theme = $state<'light'|'dark'>('light');
  let themeChosen = false;
  let importMessage = $state('');
  let guidesVisible = $state(true);
  let zoom = $state(1);
  let pan = $state({x:0,y:0});
  let fitScale = $state(1);
  let viewport: HTMLDivElement;
  let exportTrigger = $state<HTMLButtonElement>();
  let exportPanel = $state<HTMLDivElement>();
  let projectDialog: HTMLDialogElement;
  let importInput: HTMLInputElement;
  let pointer: {x:number;y:number} | null = null;
  const issues = $derived(validateProject(project));
  const blocked = $derived(issues.length>0 || Object.keys(draftErrors).length>0);
  const previewOutdated = $derived(previewProject!==project);
  const geometry = $derived(calculateGeometry(previewProject));
  const preview = $derived(svgMarkup({...previewProject,exportOptions:{...previewProject.exportOptions,guides:guidesVisible,measurements:true,marks:false}},{preview:true}));

  function syncDrafts() {
    drafts = Object.fromEntries(Object.entries(project.spec).filter(([,v])=>typeof v==='number').map(([k,v])=>[k,String(v)]));
    for (const [k,v] of Object.entries(project.barcode)) if (typeof v==='number') drafts['barcode.'+k]=String(v);
    draftErrors = {};
  }
  function setProject(next: CoverProject) {
    project = {...next,updatedAt:new Date().toISOString()};
  }
  function updateSpecField(key:string, value:string) {
    drafts = {...drafts,[key]:value};
    const parsed=parseLocalizedNumber(value);
    if (parsed===null) {draftErrors={...draftErrors,[key]:t.fieldNumber};return;}
    if (key!=='adjustment' && parsed<0) {draftErrors={...draftErrors,[key]:t.fieldNonnegative};return;}
    if (['width','height','bleed','safe'].includes(key) && parsed===0) {draftErrors={...draftErrors,[key]:t.fieldPositive};return;}
    const nextErrors={...draftErrors}; delete nextErrors[key]; draftErrors=nextErrors;
    setProject({...project,spec:{...project.spec,[key]:parsed} as CoverSpec});
  }
  function updateBarcodeField(key:string,value:string) {
    drafts={...drafts,['barcode.'+key]:value};
    const parsed=parseLocalizedNumber(value);
    if (parsed===null || parsed<0) {draftErrors={...draftErrors,['barcode.'+key]:t.fieldNumber};return;}
    const nextErrors={...draftErrors};delete nextErrors['barcode.'+key];draftErrors=nextErrors;
    setProject({...project,barcode:{...project.barcode,[key]:parsed}});
  }
  function errorFor(key:string) {return draftErrors[key] ?? issues.find(i=>i.field===key)?.message ?? ''}
  function changeConstruction(type:Construction) {
    setProject({...project,spec:defaultSpec(type)});
    syncDrafts();
  }
  function openProject(next:CoverProject) {
    project=JSON.parse(JSON.stringify(next)) as CoverProject; previewProject=project; syncDrafts();
    exportOpen=false; projectDialog.close(); zoom=1;pan={x:0,y:0};
  }
  function createNew() {
    const next=newProject(t.projectFallback);
    project=next; previewProject=next; syncDrafts(); projectDialog.close();
  }
  function duplicateCurrent() {
    const copy=duplicateProject(project);
    project=copy;previewProject=copy;syncDrafts();projectDialog.close();
  }
  async function removeProject(item:CoverProject) {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await deleteProject(item.id);
      projects=projects.filter(p=>p.id!==item.id);
      if (project.id===item.id) {
        const next=projects[0] ?? newProject();
        project=next;previewProject=next;syncDrafts();
      }
    } catch {saveState='error'}
  }
  async function importFile(event:Event) {
    const input=event.currentTarget as HTMLInputElement;
    const file=input.files?.[0]; if (!file) return;
    try {
      const imported=parseProjectFile(JSON.parse(await file.text())) as CoverProject;
      const next=projects.some(p=>p.id===imported.id)?duplicateProject(imported):imported;
      project=next;previewProject=next;syncDrafts();
      importMessage=t.importSuccess; projectDialog.close();
    } catch {importMessage=t.importError}
    input.value='';
  }
  function download(data:BlobPart,mime:string,extension:string) {
    const name=(project.name.trim()||'tajleed').replace(/[\\/:*?"<>|]/g,'-');
    const url=URL.createObjectURL(new Blob([data],{type:mime}));
    const a=document.createElement('a');a.href=url;a.download=name+'.'+extension;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function backup() {download(JSON.stringify({format:'tajleed-project',version:1,project},null,2),'application/json','tajleed.json')}
  async function exportDocument(format:'svg'|'pdf') {
    if (blocked || exportBusy) return;
    exportBusy=true; exportError='';
    try {
      if (format==='svg') {
        const {exportSvg}=await import('../lib/cover/export-svg');
        download(await exportSvg(project),'image/svg+xml','svg');
      } else {
        const {exportPdf}=await import('../lib/cover/export-pdf');
        download(new Uint8Array(await exportPdf(project)),'application/pdf','pdf');
      }
    } catch (error) {exportError=error instanceof Error ? error.message : t.exportError}
    finally {exportBusy=false}
  }
  function closeExport(returnFocus = false) {
    if (!exportOpen) return;
    exportOpen=false;
    if (returnFocus) exportTrigger?.focus();
  }
  async function toggleExport() {
    if (exportOpen) {closeExport(true);return}
    exportOpen=true;
    await tick();
    (exportPanel?.querySelector<HTMLButtonElement>('.export-actions button:not([disabled])') ?? exportPanel?.querySelector<HTMLButtonElement>('.icon-button'))?.focus();
  }
  function onWindowKeydown(event:KeyboardEvent) {
    if (exportOpen && event.key==='Escape' && !projectDialog?.open) {
      event.preventDefault();
      closeExport(true);
    }
  }
  function onWindowClick(event:MouseEvent) {
    const path=event.composedPath();
    const insidePanel=path.some(item=>item instanceof HTMLElement && item.id==='export-panel');
    if (exportOpen && !insidePanel && !(exportTrigger && path.includes(exportTrigger))) closeExport();
  }
  function fitView() {zoom=1;pan={x:0,y:0}}
  function applyTheme(next:'light'|'dark') {
    theme=next;
    document.documentElement.dataset.theme=next;
  }
  function toggleTheme() {
    const next=theme==='light'?'dark':'light';
    themeChosen=true;
    applyTheme(next);
    try {localStorage.setItem('tajleed-theme',next)} catch { /* The theme still works for this session. */ }
  }
  function updateFit() {
    if (!viewport) return;
    const r=viewport.getBoundingClientRect();
    fitScale=Math.max(0.1,Math.min((r.width-64)/geometry.width,(r.height-70)/geometry.height));
  }
  function onPointerDown(e:PointerEvent) {
    if (e.button!==0) return;
    pointer={x:e.clientX-pan.x,y:e.clientY-pan.y};
    viewport.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e:PointerEvent) {if (pointer) pan={x:e.clientX-pointer.x,y:e.clientY-pointer.y}}
  function onPointerUp(e:PointerEvent) {pointer=null;if(viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId)}
  function onPreviewKey(e:KeyboardEvent) {
    const step=e.shiftKey?40:16;
    if (e.key==='ArrowLeft') {pan={...pan,x:pan.x-step};e.preventDefault()}
    if (e.key==='ArrowRight') {pan={...pan,x:pan.x+step};e.preventDefault()}
    if (e.key==='ArrowUp') {pan={...pan,y:pan.y-step};e.preventDefault()}
    if (e.key==='ArrowDown') {pan={...pan,y:pan.y+step};e.preventDefault()}
    if (e.key==='+' || e.key==='=') {zoom=Math.min(3,zoom+0.2);e.preventDefault()}
    if (e.key==='-') {zoom=Math.max(0.4,zoom-0.2);e.preventDefault()}
    if (e.key==='0') {fitView();e.preventDefault()}
    if (e.key==='Enter' || e.key===' ') {fitView();e.preventDefault()}
  }
  onMount(()=>{
    theme=document.documentElement.dataset.theme==='dark'?'dark':'light';
    try {themeChosen=['light','dark'].includes(localStorage.getItem('tajleed-theme')??'')} catch {themeChosen=false}
    const systemTheme=window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemTheme=()=>{if (!themeChosen) applyTheme(systemTheme.matches?'dark':'light')};
    systemTheme.addEventListener('change',onSystemTheme);
    previewProject=project; syncDrafts();
    const observer=new ResizeObserver(updateFit);
    observer.observe(viewport);
    (async()=>{
      try {
        projects=await listProjects();
        const last=await lastProjectId();
        const saved=projects.find(p=>p.id===last)??projects[0];
        if (saved) {project=saved;previewProject=saved;syncDrafts()}
        saveState='saved';
      } catch {saveState='error'}
      ready=true; updateFit();
    })();
    return ()=>{observer.disconnect();systemTheme.removeEventListener('change',onSystemTheme)};
  });
  $effect(()=>{
    if (!ready) return;
    const snapshot=project;
    saveState='saving';
    const timer=setTimeout(async()=>{
      try {
        await saveProject(snapshot);
        projects=[snapshot,...projects.filter(p=>p.id!==snapshot.id)].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
        if (project.id===snapshot.id && project.updatedAt===snapshot.updatedAt) saveState='saved';
      } catch {saveState='error'}
    },450);
    return ()=>clearTimeout(timer);
  });
  $effect(()=>{if (!blocked) previewProject=project});
  $effect(()=>{geometry;updateFit()});
</script>

<svelte:window onkeydown={onWindowKeydown} onclick={onWindowClick} />

{#snippet numberField(key:string,label:string,hint = '')}
  <div class="field">
    <label for={'field-'+key}>{label} <span class="unit">{t.unit}</span></label>
    <input id={'field-'+key} type="text" inputmode="decimal" dir="ltr" value={drafts[key]??''} aria-invalid={!!errorFor(key)} aria-describedby={errorFor(key)?'error-'+key:hint?'hint-'+key:undefined} oninput={(e)=>updateSpecField(key,e.currentTarget.value)} />
    {#if hint}<small id={'hint-'+key}>{hint}</small>{/if}
    {#if errorFor(key)}<small class="field-error" id={'error-'+key}>{errorFor(key)}</small>{/if}
  </div>
{/snippet}
{#snippet barcodeField(key:'x'|'y'|'width'|'height',label:string)}
  <div class="field">
    <label for={'barcode-'+key}>{label} <span class="unit">{t.unit}</span></label>
    <input id={'barcode-'+key} type="text" inputmode="decimal" dir="ltr" value={drafts['barcode.'+key]??''} aria-invalid={!!errorFor('barcode.'+key)} oninput={(e)=>updateBarcodeField(key,e.currentTarget.value)} />
  </div>
{/snippet}

<svelte:head>
  <title>{t.appName} — {t.preview}</title>
  <meta name="description" content={t.metaDescription} />
</svelte:head>

<div class="app-shell" dir="rtl">
  <header class="topbar">
    <div class="brand"><img class="brand-icon" src="/brand/icon-192.png" alt="" /><img class="wordmark-light" src="/brand/tajleed-wordmark-cocoa.svg" alt={t.appName} /><img class="wordmark-dark" src="/brand/tajleed-wordmark-white.svg" alt={t.appName} /><span class="brand-divider"></span><span class="brand-subtitle">{t.preview}</span></div>
    <div class="project-title"><label for="project-name" class="sr-only">{t.projectName}</label><input id="project-name" value={project.name} maxlength="120" oninput={(e)=>setProject({...project,name:e.currentTarget.value})} /><span class:save-error={saveState==='error'} class="save-state" role="status">{saveState==='saved'?t.saveReady:saveState==='saving'?t.saving:t.saveFailed}</span></div>
    <div class="header-actions">
      <button class="theme-toggle" aria-label={theme==='dark'?t.lightMode:t.darkMode} title={theme==='dark'?t.lightMode:t.darkMode} aria-pressed={theme==='dark'} onclick={toggleTheme}>
        {#if theme==='dark'}<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>{:else}<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"/></svg>{/if}
      </button>
      <button class="text-button" onclick={()=>projectDialog.showModal()}>{t.projects}</button>
      <button bind:this={exportTrigger} class="primary-button" aria-controls="export-panel" aria-expanded={exportOpen} onclick={toggleExport}>{t.exportTemplate}</button>
    </div>
  </header>

  <div class="workspace">
    <aside class="settings" aria-label={t.settingsLabel}>
      <div class="settings-intro"><h1>{t.build}</h1><p>{t.startingValues}</p></div>
      <details open>
        <summary>{t.build}</summary>
        <div class="section-body">
          <div class="field"><label for="construction">{t.construction}</label><select id="construction" value={project.spec.type} onchange={(e)=>changeConstruction(e.currentTarget.value as Construction)}><option value="paperback">{t.paperback}</option><option value="hardcover">{t.hardcover}</option><option value="jacket">{t.jacket}</option></select></div>
          <div class="field"><label for="opening">{t.opening}</label><select id="opening" value={project.opening} onchange={(e)=>setProject({...project,opening:e.currentTarget.value as Opening})}><option value="arabic">{t.arabicOpening}</option><option value="english">{t.englishOpening}</option></select></div>
        </div>
      </details>
      <details open>
        <summary>{t.dimensions}</summary>
        <div class="section-body">
          <div class="field-grid">{@render numberField('width',t.trimWidth)}{@render numberField('height',t.trimHeight)}</div>
          {#if project.spec.type==='paperback'}
            <div class="field"><label for="spine-mode">{t.spineMode}</label><select id="spine-mode" value={project.spec.spineMode} onchange={(e)=>setProject({...project,spec:{...project.spec,spineMode:e.currentTarget.value as 'manual'|'estimate'} as CoverSpec})}><option value="manual">{t.manual}</option><option value="estimate">{t.estimate}</option></select></div>
            {#if project.spec.spineMode==='estimate'}
              <div class="field-grid">{@render numberField('pages',t.pages,t.pageHint)}{@render numberField('sheetThickness',t.sheetThickness,t.thicknessHint)}</div>
              {@render numberField('adjustment',t.adjustment)}
              <p class="calculated">{t.spine}: <bdi>{formatMm(effectiveSpine(project))} {t.unit}</bdi></p>
            {:else}{@render numberField('spine',t.spine)}{/if}
          {:else}
            {@render numberField('spine',t.spine)}
            <p class="field-note">{t.printerHint}</p>
          {/if}
          {#if project.spec.type==='hardcover'}
            <div class="field-grid">{@render numberField('hinge',t.hinge)}{@render numberField('turnIn',t.turnIn)}</div>
          {:else}
            <div class="field-grid">{@render numberField('frontFlap',t.frontFlap)}{@render numberField('backFlap',t.backFlap)}</div>
          {/if}
          <div class="field-grid">{@render numberField('bleed',t.bleed)}{@render numberField('safe',t.safe)}</div>
        </div>
      </details>
      <details>
        <summary>{t.guides}</summary>
        <div class="section-body check-stack">
          <label class="check-row"><input type="checkbox" checked={project.exportOptions.guides} onchange={(e)=>setProject({...project,exportOptions:{...project.exportOptions,guides:e.currentTarget.checked}})} />{t.includeGuides}</label>
          <label class="check-row"><input type="checkbox" checked={project.exportOptions.measurements} onchange={(e)=>setProject({...project,exportOptions:{...project.exportOptions,measurements:e.currentTarget.checked}})} />{t.includeMeasurements}</label>
          <label class="check-row"><input type="checkbox" checked={project.exportOptions.marks} onchange={(e)=>setProject({...project,exportOptions:{...project.exportOptions,marks:e.currentTarget.checked}})} />{t.includeMarks}</label>
        </div>
      </details>
      <details>
        <summary>{t.barcode}</summary>
        <div class="section-body">
          <label class="check-row"><input type="checkbox" checked={project.barcode.enabled} onchange={(e)=>setProject({...project,barcode:{...project.barcode,enabled:e.currentTarget.checked}})} />{t.barcodeEnabled}</label>
          {#if project.barcode.enabled}
            <div class="field"><label for="isbn">{t.isbn}</label><input id="isbn" type="text" dir="ltr" inputmode="numeric" value={project.barcode.isbn} aria-invalid={!!errorFor('isbn')} aria-describedby={errorFor('isbn')?'isbn-error':undefined} oninput={(e)=>setProject({...project,barcode:{...project.barcode,isbn:e.currentTarget.value}})} />{#if errorFor('isbn')}<small class="field-error" id="isbn-error">{errorFor('isbn')}</small>{/if}</div>
            <div class="field-grid">{@render barcodeField('x',t.barcodeX)}{@render barcodeField('y',t.barcodeY)}{@render barcodeField('width',t.barcodeWidth)}{@render barcodeField('height',t.barcodeHeight)}</div>
            {#if errorFor('barcode')}<p class="field-error">{errorFor('barcode')}</p>{/if}
            <p class="field-note">{t.quietZones}</p>
          {/if}
        </div>
      </details>
    </aside>

    <main class="preview-area">
      <div class="preview-head"><div><h2>{t.preview}</h2><p>{t.outsideSpread} · {project.spec.type==='paperback'?t.paperback:project.spec.type==='hardcover'?t.hardcover:t.jacket}</p></div><div class="document-size"><span>{t.dimensionsLabel}</span><bdi>{formatMm(geometry.width)} × {formatMm(geometry.height)} {t.unit}</bdi></div></div>
      <div class="preview-toolbar" aria-label={t.previewToolsLabel}><button onclick={fitView}>{t.fit}</button><button aria-label={t.zoomOut} onclick={()=>zoom=Math.max(0.4,zoom-0.2)}>−</button><output dir="ltr">{Math.round(zoom*100)}%</output><button aria-label={t.zoomIn} onclick={()=>zoom=Math.min(3,zoom+0.2)}>+</button><span class="toolbar-separator"></span><label class="check-row compact"><input type="checkbox" checked={guidesVisible} onchange={(e)=>guidesVisible=e.currentTarget.checked} />{t.showGuides}</label></div>
      <div class="preview-viewport" bind:this={viewport} tabindex="0" role="button" aria-label={t.previewKeyHint} aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight + - 0 Enter" onpointerdown={onPointerDown} onpointermove={onPointerMove} onpointerup={onPointerUp} onpointercancel={onPointerUp} onkeydown={onPreviewKey}>
        <div class="preview-document" style={'width:'+geometry.width*fitScale+'px;height:'+geometry.height*fitScale+'px;transform:translate('+pan.x+'px,'+pan.y+'px) scale('+zoom+')'}>{@html preview}</div>
      </div>
      <div class="preview-foot"><span>{t.trimLabel}: <bdi>{formatMm(geometry.cut.width)} × {formatMm(geometry.cut.height)} {t.unit}</bdi></span><span>{t.dragHint}</span></div>
      {#if Object.keys(draftErrors).length>0 || previewOutdated}<p class="notice warning" role="status">{t.lastValid}</p>{:else if issues.length>0}<p class="notice warning" role="status">{issues.some(i=>i.field==='spine')?t.spineRequired:t.errors}</p>{/if}
      {#if exportOpen}<div bind:this={exportPanel} id="export-panel" class="export-panel" role="region" aria-label={t.exportTemplate}><div class="export-panel-head"><h3>{t.exportTemplate}</h3><button class="icon-button" aria-label={t.close} onclick={()=>closeExport(true)}>×</button></div><p>{t.exportHint}</p><div class="export-actions"><button disabled={blocked||exportBusy} onclick={()=>exportDocument('svg')}>{t.svg}</button><button disabled={blocked||exportBusy} onclick={()=>exportDocument('pdf')}>{t.pdf}</button></div><button class="backup-link" onclick={backup}>{t.backup}</button>{#if exportError}<p class="field-error" role="alert">{exportError}</p>{/if}{#if blocked}<p class="field-error">{t.errors}</p>{/if}</div>{/if}
    </main>
  </div>
</div>

<dialog bind:this={projectDialog} class="project-dialog" aria-labelledby="projects-heading" onclose={()=>importMessage=''}>
  <div class="dialog-head"><h2 id="projects-heading">{t.projectList}</h2><button class="icon-button" aria-label={t.close} onclick={()=>projectDialog.close()}>×</button></div>
  <div class="dialog-actions"><button class="primary-button" onclick={createNew}>{t.newProject}</button><button onclick={duplicateCurrent}>{t.duplicate}</button><button onclick={()=>importInput.click()}>{t.import}</button><input bind:this={importInput} type="file" accept=".json,.tajleed.json,application/json" class="sr-only" onchange={importFile} /></div>
  {#if importMessage}<p role="status" class="notice">{importMessage}</p>{/if}
  {#if projects.length===0}<p class="empty-message">{t.noProjects}</p>{/if}
  <ul class="project-list">{#each projects as item (item.id)}<li><div><strong>{item.name}</strong><small>{item.spec.type==='paperback'?t.paperback:item.spec.type==='hardcover'?t.hardcover:t.jacket} · <bdi>{new Intl.DateTimeFormat('ar',{dateStyle:'medium'}).format(new Date(item.updatedAt))}</bdi></small></div><div class="row-actions"><button onclick={()=>openProject(item)}>{t.open}</button><button class="danger-button" onclick={()=>removeProject(item)}>{t.delete}</button></div></li>{/each}</ul>
</dialog>
