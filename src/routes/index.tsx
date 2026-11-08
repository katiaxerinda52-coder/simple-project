import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, CakeSlice, Check, ChevronDown, CircleHelp, FileDown, Layers3, Minus, Plus, Printer, Sparkles } from "lucide-react";
import { weddingCakeRecipes } from "../data/wedding-cake-recipes";
import { scaleRecipeByReferenceVolume } from "../data/recipe-scaling";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Massas de Noiva Pro | Calculadora profissional" },
      { name: "description", content: "Calculadora profissional de massas de noiva para confeiteiras." },
    ],
  }),
});

type Floor = { id: number; diameter: number; height: number };
const heights = [10, 12, 15, 17];
const doughs = [
  { id: "alcohol", name: "Massa de noiva com álcool", detail: "Receita tradicional" },
  { id: "without", name: "Massa de noiva sem álcool", detail: "Sem bebidas alcoólicas" },
  { id: "beer", name: "Massa de noiva com cerveja preta", detail: "Com cerveja preta" },
];

function Index() {
  const [mode, setMode] = useState<"single" | "tiered">("single");
  const [dough, setDough] = useState("alcohol");
  const [diameter, setDiameter] = useState(20);
  const [height, setHeight] = useState(15);
  const [floors, setFloors] = useState<Floor[]>([
    { id: 1, diameter: 26, height: 15 },
    { id: 2, diameter: 20, height: 12 },
    { id: 3, diameter: 14, height: 10 },
  ]);
  const [calculated, setCalculated] = useState(false);
  const [activeTab, setActiveTab] = useState("ingredients");
  const selectedDough = doughs.find((item) => item.id === dough) ?? doughs[1];
  const diameterOptions = useMemo(() => Array.from({ length: 26 }, (_, i) => i + 10), []);
  const recipeKey: keyof typeof weddingCakeRecipes = dough === "alcohol" ? "alcohol" : dough === "without" ? "without-alcohol" : "black-beer";
  const selectedRecipe = weddingCakeRecipes[recipeKey];
  const targetPans = mode === "single"
    ? [{ id: 1, diameterCm: diameter, heightCm: height }]
    : floors.map((floor) => ({ id: floor.id, diameterCm: floor.diameter, heightCm: floor.height }));
  const scaledResult = selectedRecipe.status === "configured" && selectedRecipe.calibration.referencePans.length
    ? scaleRecipeByReferenceVolume(selectedRecipe.batterIngredients, selectedRecipe.calibration.referencePans, targetPans)
    : null;
  const formatQuantity = (quantity: number, unit: string) => {
    const rounded = Number(quantity.toFixed(unit === "g" ? 1 : 2));
    return unit === "g" ? `${rounded.toLocaleString("pt-PT")} g` : `${rounded.toLocaleString("pt-PT")} ${unit}`;
  };

  const updateFloor = (id: number, field: "diameter" | "height", value: number) => {
    setFloors((current) => current.map((floor) => floor.id === id ? { ...floor, [field]: value } : floor));
    setCalculated(false);
  };
  const addFloor = () => {
    setFloors((current) => [...current, { id: Math.max(0, ...current.map((f) => f.id)) + 1, diameter: 18, height: 12 }]);
    setCalculated(false);
  };
  const removeFloor = (id: number) => {
    setFloors((current) => current.length > 2 ? current.filter((floor) => floor.id !== id) : current);
    setCalculated(false);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Massas de Noiva Pro início">
          <span className="brand-mark"><CakeSlice size={22} strokeWidth={1.7} /></span>
          <span><strong>massas de noiva <i>pro</i></strong><small>PRECISÃO EM CADA ANDAR</small></span>
        </a>
        <div className="topbar-right"><span className="status-dot" /> FERRAMENTA PROFISSIONAL <span className="topbar-divider" /> <span className="topbar-version">V 1.0</span></div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={13} /> A SUA CONFEITARIA, COM MAIS PRECISÃO</div>
          <h1>O segredo de um bolo perfeito começa <em>na medida certa.</em></h1>
          <p>Calcule a quantidade de massa e organize os ingredientes para produzir bolos de noiva com confiança.</p>
          <div className="hero-note"><span className="hero-note-icon"><Check size={14} /></span> Cálculos pensados para a realidade da confeitaria profissional</div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="cake-illustration"><div className="cake-top" /><div className="cake-tier tier-top" /><div className="cake-tier tier-middle" /><div className="cake-tier tier-bottom" /><div className="cake-plate" /></div>
          <span className="art-spark spark-a">✦</span><span className="art-spark spark-b">✧</span>
          <div className="art-caption">FEITO PARA CONFEITEIRAS</div>
        </div>
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div><span className="section-kicker">CALCULADORA</span><h2>O que vamos preparar hoje?</h2><p>Escolha o formato do bolo para começar.</p></div>
          <div className="step-indicator"><span>01</span><div /><span className="step-muted">02</span><div /><span className="step-muted">03</span></div>
        </div>

        <div className="mode-grid">
          <button className={`mode-card ${mode === "single" ? "selected" : ""}`} onClick={() => { setMode("single"); setCalculated(false); }}>
            <span className="mode-icon"><CakeSlice size={22} /></span><span className="mode-text"><strong>Bolo individual</strong><small>Uma única forma, uma receita ajustada.</small></span><span className="mode-check">{mode === "single" && <Check size={15} />}</span>
          </button>
          <button className={`mode-card ${mode === "tiered" ? "selected" : ""}`} onClick={() => { setMode("tiered"); setCalculated(false); }}>
            <span className="mode-icon"><Layers3 size={22} /></span><span className="mode-text"><strong>Bolo de vários andares</strong><small>Configure cada andar e consolide a receita.</small></span><span className="mode-check">{mode === "tiered" && <Check size={15} />}</span>
          </button>
        </div>

        <div className="calculator-card">
          <div className="card-topline"><div><span className="section-kicker">CONFIGURAÇÃO</span><h3>Personalize o seu bolo</h3></div><span className="required-label">* Campos obrigatórios</span></div>
          <div className="field-block">
            <label>01 <span>TIPO DE MASSA</span></label>
            <div className="dough-grid">
              {doughs.map((item) => <button key={item.id} className={`dough-option ${dough === item.id ? "active" : ""}`} onClick={() => { setDough(item.id); setCalculated(false); }}>
                <span className="radio-dot">{dough === item.id && <span />}</span><span><strong>{item.name}</strong><small>{item.detail}</small></span>
              </button>)}
            </div>
          </div>

          {mode === "single" ? <div className="field-block dimension-block">
            <label>02 <span>DIMENSÕES DA FORMA</span></label>
            <div className="dimension-grid">
              <div className="input-group"><span>DIÂMETRO</span><div className="select-wrap"><select value={diameter} onChange={(e) => { setDiameter(Number(e.target.value)); setCalculated(false); }}>{diameterOptions.map((n) => <option key={n} value={n}>{n} cm</option>)}</select><ChevronDown size={16} /></div></div>
              <div className="input-group"><span>ALTURA</span><div className="select-wrap"><select value={height} onChange={(e) => { setHeight(Number(e.target.value)); setCalculated(false); }}>{heights.map((n) => <option key={n} value={n}>{n} cm</option>)}</select><ChevronDown size={16} /></div></div>
            </div>
            <div className="dimension-hint">Diâmetros disponíveis de 10 a 35 cm · Alturas de 10, 12, 15 e 17 cm</div>
          </div> : <div className="field-block floors-block">
            <div className="floors-title"><label>02 <span>DIMENSÕES POR ANDAR</span></label><span className="floor-count">{floors.length} ANDARES</span></div>
            <div className="floor-list">
              {floors.map((floor, index) => <div className="floor-row" key={floor.id}>
                <span className="floor-number">{String(index + 1).padStart(2, "0")}</span><strong>Andar {index + 1}</strong>
                <div className="floor-select"><small>DIÂMETRO</small><div className="select-wrap"><select value={floor.diameter} onChange={(e) => updateFloor(floor.id, "diameter", Number(e.target.value))}>{diameterOptions.map((n) => <option key={n} value={n}>{n} cm</option>)}</select><ChevronDown size={14} /></div></div>
                <div className="floor-select"><small>ALTURA</small><div className="select-wrap"><select value={floor.height} onChange={(e) => updateFloor(floor.id, "height", Number(e.target.value))}>{heights.map((n) => <option key={n} value={n}>{n} cm</option>)}</select><ChevronDown size={14} /></div></div>
                <button className="remove-floor" onClick={() => removeFloor(floor.id)} disabled={floors.length <= 2} aria-label={`Remover andar ${index + 1}`}><Minus size={16} /></button>
              </div>)}
            </div>
            <button className="add-floor" onClick={addFloor}><Plus size={15} /> Adicionar andar</button>
          </div>}

          <div className="calculator-actions">
            <div className="privacy-note"><CircleHelp size={15} /><span>As suas configurações ficam nesta sessão.</span></div>
            <button className="calculate-button" onClick={() => { setCalculated(true); setActiveTab("ingredients"); }}>Preparar cálculo <ArrowRight size={17} /></button>
          </div>
        </div>

        {calculated && <section className="results-card">
          <div className="results-heading"><div><span className="section-kicker">RESULTADO</span><h3>Ficha de produção</h3></div><button className="print-button" onClick={() => window.print()}><Printer size={16} /> Imprimir / Guardar PDF</button></div>
          <div className="results-summary"><div><small>TIPO DE MASSA</small><strong>{selectedDough.name}</strong></div><div><small>CONFIGURAÇÃO</small><strong>{mode === "single" ? `${diameter} cm × ${height} cm` : `${floors.length} andares`}</strong></div><div><small>ESTADO DA RECEITA</small><strong className="pending-text">{scaledResult ? "Estimativa por volume" : "Em configuração"}</strong></div></div>
          <div className="result-tabs">{[["ingredients","Ingredientes"],["distribution","Distribuição"],["method","Preparo"]].map(([id,label]) => <button key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>{label}</button>)}</div>
          {scaledResult ? <div className="recipe-results">
            {activeTab === "ingredients" && <div className="ingredient-result">
              <div className="calculation-note"><strong>Receita completa para preparar de uma só vez</strong><span>Factor de escala: {scaledResult.factor.toFixed(3)}× · Base: 20 × 12 cm + 14 × 13 cm</span></div>
              <h4 className="ingredient-section-title">Ingredientes da massa</h4>
              <div className="ingredient-list">{scaledResult.ingredients.map((ingredient) => <div className="ingredient-line" key={ingredient.name}><span><strong>{ingredient.name}</strong>{ingredient.note && <small>{ingredient.note}</small>}</span><b>{formatQuantity(ingredient.totalQuantity, ingredient.unit)}</b></div>)}</div>
              {selectedRecipe.components.length > 0 && <><h4 className="ingredient-section-title">Preparações prévias</h4>{selectedRecipe.components.map((component) => <div className="component-ingredient-group" key={component.name}><strong>{component.name}</strong><div className="ingredient-list">{component.ingredients.map((ingredient) => <div className="ingredient-line" key={ingredient.name}><span><strong>{ingredient.name}</strong>{ingredient.note && <small>{ingredient.note}</small>}</span><b>{formatQuantity(ingredient.quantity * scaledResult.factor, ingredient.unit)}</b></div>)}</div></div>)}</>}
              <p className="method-caveat">As quantidades são escaladas para o conjunto de formas seleccionado. A uva passa é pesada antes de demolhar. O líquido da demolha usado para humedecer o bolo é quanto baste, conforme a absorção. Estimativa proporcional ao volume cilíndrico; a massa crua em gramas por forma depende de uma pesagem real da receita.</p>
            </div>}
            {activeTab === "distribution" && <div className="distribution-result">
              {targetPans.map((pan) => {
                const volume = Math.PI * Math.pow(pan.diameterCm / 2, 2) * pan.heightCm;
                const share = volume / scaledResult.targetVolumeCm3;
                return <div className="distribution-line" key={pan.id}><span><strong>{mode === "single" ? "Forma seleccionada" : `Andar / forma ${pan.id}`}</strong><small>{pan.diameterCm} cm × {pan.heightCm} cm</small></span><b>{(share * 100).toFixed(1)}% da massa total</b></div>;
              })}
              <div className="distribution-total"><span>Distribuição total</span><strong>100%</strong></div>
              <h4 className="ingredient-section-title">Ingredientes estimados por forma</h4>
              <p className="method-caveat">Cada coluna mostra a quantidade proporcional destinada à respectiva forma, calculada pelo volume.</p>
              <div className="pan-ingredient-table"><div className="pan-ingredient-row pan-ingredient-header" style={{ gridTemplateColumns: `minmax(150px,1.5fr) repeat(${targetPans.length}, minmax(100px,1fr))` }}><strong>Ingrediente</strong>{targetPans.map((pan) => <strong key={pan.id}>{pan.diameterCm} × {pan.heightCm} cm</strong>)}</div>
                {scaledResult.ingredients.map((ingredient) => <div className="pan-ingredient-row" key={ingredient.name} style={{ gridTemplateColumns: `minmax(150px,1.5fr) repeat(${targetPans.length}, minmax(100px,1fr))` }}><span>{ingredient.name}</span>{ingredient.byPan.map((part) => <b key={part.panId}>{formatQuantity(part.quantity, ingredient.unit)}</b>)}</div>)}
              </div>
              <p className="method-caveat">Valores proporcionais, não pesagens reais. A massa crua por forma deve ser confirmada numa produção de referência.</p>
            </div>}
            {activeTab === "method" && <div className="method-result">
              {[...selectedRecipe.components.flatMap((component) => component.steps), ...selectedRecipe.preparation].map((step, index) => <div className="method-step" key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{step.title}</strong><p>{step.instructions}</p>{step.warning && <small className="warning-note">{step.warning}</small>}</div></div>)}
              <div className="recipe-notes"><strong>Notas da receita</strong>{selectedRecipe.notes.map((note) => <p key={note}>{note}</p>)}</div>
            </div>}
          </div> : <div className="pending-panel"><span className="pending-icon"><FileDown size={22} /></span><h4>Estamos a preparar esta receita.</h4><p>As quantidades e o método de preparo de <strong>{selectedDough.name.toLowerCase()}</strong> serão apresentados aqui depois de configurarmos a sua receita original.</p><span className="pending-tag">AGUARDA RECEITA ORIGINAL</span></div>}
        </section>}
      </section>

      <footer className="footer"><div className="footer-brand">massas de noiva <i>pro</i></div><span>Precisão, técnica e confiança em cada criação.</span><span className="footer-copy">© 2026 · TODOS OS DIREITOS RESERVADOS</span></footer>
    </main>
  );
}
