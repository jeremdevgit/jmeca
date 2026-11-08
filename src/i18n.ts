import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import zh from './locales/zh-CN.json';
import ja from './locales/ja.json';

export const languages = [
  ['fr', 'Français'], ['en', 'English'], ['es', 'Español'], ['de', 'Deutsch'],
  ['it', 'Italiano'], ['pt', 'Português'], ['zh-CN', '中文'], ['ja', '日本語'],
] as const;
export type Language = typeof languages[number][0];
const dictionaries: Record<Exclude<Language,'fr'>, Record<string,string>> = {en,es,de,it,pt,'zh-CN':zh,ja};
const languageKeys = languages.map(([key]) => key);
function normalize(input: string): Language {
  const value = input.toLowerCase();
  if (value.startsWith('zh')) return 'zh-CN';
  return languageKeys.find(key => value === key || value.startsWith(key + '-')) ?? 'fr';
}
function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem('jmeca.language');
    if (saved) return normalize(saved);
  } catch { /* Storage can be disabled in a browser preview. */ }
  for (const item of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const language = normalize(item);
    if (language !== 'fr' || item.toLowerCase().startsWith('fr')) return language;
  }
  return 'fr';
}
const monthUnit: Record<Exclude<Language,'fr'>,string> = {en:'months',es:'meses',de:'Monate',it:'mesi',pt:'meses','zh-CN':'个月',ja:'か月'};
const pendingDue: Record<Exclude<Language,'fr'>,string> = {en:'maintenance items to check on your vehicle.',es:'tareas de mantenimiento por revisar en tu vehículo.',de:'Wartungspunkte an Ihrem Fahrzeug zu prüfen.',it:'interventi da verificare sul veicolo.',pt:'itens de manutenção a verificar no veículo.','zh-CN':'项保养提醒需要检查。',ja:'件の整備項目を確認してください。'};
let current = initialLanguage();
export function language(): Language { return current; }
export function languageTag(): string { return current === 'zh-CN' ? 'zh-CN' : current; }
export function setLanguage(value: string): void {
  current = normalize(value);
  document.documentElement.lang = current;
  try { localStorage.setItem('jmeca.language', current); } catch { /* Optional preference only. */ }
}
export function t(text: string): string {
  if (current === 'fr') return text;
  const exact = dictionaries[current][text];
  if (exact) return exact;
  const remaining = text.match(/^([\d\s.,\u00a0]+) km restants$/);
  if (remaining) return `${remaining[1]} ${dictionaries[current]['km restants'] || 'km'}`;
  const exceeded = text.match(/^([\d\s.,\u00a0]+) km dépassés$/);
  if (exceeded) return `${exceeded[1]} ${dictionaries[current]['km dépassés'] || 'km'}`;
  const months = text.match(/^(.*\b\d+) mois$/);
  if (months) return `${months[1]} ${monthUnit[current]}`;
  const pending = text.match(/^(\d+) échéances? à vérifier sur votre véhicule\.$/);
  if (pending) return `${pending[1]} ${pendingDue[current]}`;
  const relative = text.match(/^(?:Dans (\d+) jours|(\d+) j de retard)( · .+)?$/);
  if (relative) {
    const days = relative[1] ? Number(relative[1]) : -Number(relative[2]);
    return new Intl.RelativeTimeFormat(languageTag(), {numeric:'auto'}).format(days, 'day') + (relative[3] || '');
  }
  return text;
}
export function languageSelector(): string {
  return `<label class="language-switch"><span class="sr-only">Langue / Language</span><select id="language-select" aria-label="Langue / Language">${languages.map(([key,name]) => `<option value="${key}" ${key === current ? 'selected' : ''}>${name}</option>`).join('')}</select></label>`;
}
export function translateDOM(container: ParentNode): void {
  document.documentElement.lang = current;
  if (current === 'fr') return;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    if (node.parentElement?.closest('script,style,textarea')) continue;
    const original = node.textContent ?? '';
    const trimmed = original.trim();
    if (!trimmed) continue;
    const translated = t(trimmed);
    if (translated !== trimmed) node.textContent = original.replace(trimmed, translated);
  }
  container.querySelectorAll?.<HTMLElement>('[placeholder],[aria-label],[title]').forEach(element => {
    for (const name of ['placeholder','aria-label','title']) {
      const value = element.getAttribute(name);
      if (value) element.setAttribute(name, t(value));
    }
  });
}
