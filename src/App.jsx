import { useEffect, useRef, useState } from "react";
import "./App.css";

const NAV_ITEMS = [
  "General",
  "Field attributes",
  "Nomenclature",
  "Notifications",
  "Workflow",
  "Discipline",
  "Default assignees",
  "Default Annotation Styles",
  "Publish as",
];

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
      <path
        fill="#1e6fd9"
        d="M16 2L28 10v12L16 30 4 22V10L16 2zm0 4.5L8 12v8l8 4.5 8-4.5v-8L16 6.5z"
      />
    </svg>
  );
}

function IconHelp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.8 2.2c-.6.4-1.3 1-1.3 2.3V14" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z" />
      <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2z" strokeLinejoin="round" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6h12zM10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconInfoCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}

const ANNOTATION_TYPE_OPTIONS = ["Cloud", "Circle", "Line", "RFI", "Issue", "Punch Item"];

const COLOR_OPTIONS = [
  { label: "Red", hex: "#e53935" },
  { label: "Green", hex: "#2e7d32" },
  { label: "Yellow", hex: "#f9a825" },
];

/** Stroke / border dash patterns (matches Style → Border dropdown). */
const BORDER_STYLE_OPTIONS = [
  "Solid",
  "Dashed (Regular)",
  "Dotted",
  "Dash-Dot",
  "Dash-Dot-Dot",
  "Long Dash",
  "Short Dash",
  "Wavy / Squiggly",
];

const DEFAULT_BORDER_STYLE = BORDER_STYLE_OPTIONS[0];

// const COMPANY_OPTIONS = ["Westside Mechanical", "ABC Plumbing", "Trimble"];

const STROKE_WEIGHT_MIN = 0.1;
const STROKE_WEIGHT_MAX = 20;
const DEFAULT_STROKE_WEIGHT = 1;

function clampStrokeWeight(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return DEFAULT_STROKE_WEIGHT;
  return Math.min(STROKE_WEIGHT_MAX, Math.max(STROKE_WEIGHT_MIN, x));
}

function normalizeStrokeWeight(n) {
  return Math.round(clampStrokeWeight(n) * 100) / 100;
}

function rowAnnotationTypes(row) {
  if (Array.isArray(row.annotationTypes)) return row.annotationTypes;
  if (typeof row.annotationType === "string" && row.annotationType) return [row.annotationType];
  return [ANNOTATION_TYPE_OPTIONS[0]];
}

/* Company-scoped uniqueness (annotation type + company):
function pairKey(type, company) {
  return `${type}\0${company}`;
}

function rowPairKeys(row) {
  const types = rowAnnotationTypes(row);
  const companies = Array.isArray(row.companies) ? row.companies : [];
  const keys = [];
  for (const t of types) {
    for (const c of companies) {
      keys.push(pairKey(t, c));
    }
  }
  return keys;
}

function pairKeyToRowIdMap(rows, excludeRowId) {
  const map = new Map();
  for (const row of rows) {
    if (row.id === excludeRowId) continue;
    for (const k of rowPairKeys(row)) {
      if (!map.has(k)) map.set(k, row.id);
    }
  }
  return map;
}

function findPairConflicts(candidate, rows, excludeRowId) {
  const owners = pairKeyToRowIdMap(rows, excludeRowId);
  const out = [];
  const types = rowAnnotationTypes(candidate);
  const companies = Array.isArray(candidate.companies) ? candidate.companies : [];
  for (const t of types) {
    for (const c of companies) {
      const otherRowId = owners.get(pairKey(t, c));
      if (otherRowId) {
        out.push({ type: t, company: c, otherRowId });
      }
    }
  }
  return out;
}

function formatConflictPairs(conflicts) {
  const seen = new Set();
  const parts = [];
  for (const { type, company } of conflicts) {
    const k = pairKey(type, company);
    if (seen.has(k)) continue;
    seen.add(k);
    parts.push(`${type} + ${company}`);
  }
  return parts.join("; ");
}
*/

function createDefaultAnnotationRows() {
  return [
    {
      id: crypto.randomUUID(),
      annotationTypes: ["Cloud"],
      fillColor: "Green",
      fillOpacity: 50,
      strokeColor: "Green",
      strokeOpacity: 100,
      borderStyle: DEFAULT_BORDER_STYLE,
      strokeWeight: 1,
      // companies: ["Westside Mechanical"],
    },
  ];
}

const ANNOTATION_TABLE_COLUMNS = [
  "Annotation Type",
  "Fill Color",
  "Fill Opacity",
  "Stroke Color",
  "Stroke Opacity",
  // "Border Style", // hidden — still stored on row / set in Add dialog
  // "Stroke Weight",
  // "Company",
];

const defaultFormState = () => ({
  annotationTypes: [ANNOTATION_TYPE_OPTIONS[0]],
  fillColor: COLOR_OPTIONS[0].label,
  fillOpacity: 100,
  strokeColor: COLOR_OPTIONS[0].label,
  strokeOpacity: 100,
  borderStyle: DEFAULT_BORDER_STYLE,
  strokeWeight: DEFAULT_STROKE_WEIGHT,
  // companies: [],
});

function MultiTagPicker({
  id,
  labelledBy,
  options,
  value,
  onChange,
  compact = false,
  allSelectedPlaceholder = "All items added",
  addPlaceholder = "Type or click to add…",
  emptyFilterMessage = "No matching items",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const available = options.filter(
    (o) => !value.includes(o) && o.toLowerCase().includes(query.trim().toLowerCase())
  );
  const safeIdx = Math.min(activeIdx, Math.max(0, available.length - 1));
  const allSelected = options.length > 0 && options.every((o) => value.includes(o));

  useEffect(() => {
    if (allSelected) setOpen(false);
  }, [allSelected]);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(/** @type {Node} */ (e.target))) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocPointerDown);
    return () => document.removeEventListener("mousedown", onDocPointerDown);
  }, [open]);

  function addTag(name) {
    if (value.includes(name)) return;
    onChange([...value, name]);
    setQuery("");
    setActiveIdx(0);
    inputRef.current?.focus();
  }

  function removeTag(name) {
    onChange(value.filter((c) => c !== name));
  }

  function handleKeyDown(e) {
    if (e.key === "Backspace" && query === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
      return;
    }

    if (!available.length) {
      if (e.key === "Escape") setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(i + 1, available.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = available[safeIdx];
      if (pick) addTag(pick);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const listboxId = `${id}-listbox`;

  return (
    <div ref={rootRef} className={compact ? "company-tag-picker company-tag-picker--compact" : "company-tag-picker"}>
      <div
        className={`company-tag-picker__field ${open && available.length ? "company-tag-picker__field--open" : ""}`}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) inputRef.current?.focus();
        }}
      >
        {value.map((name) => (
          <span key={name} className="company-chip">
            <span className="company-chip__text">{name}</span>
            <button
              type="button"
              className="company-chip__remove"
              aria-label={`Remove ${name}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => removeTag(name)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          className="company-tag-picker__input"
          type="text"
          role="combobox"
          aria-expanded={open && available.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-labelledby={labelledBy}
          disabled={allSelected}
          value={query}
          placeholder={allSelected ? allSelectedPlaceholder : value.length ? "" : addPlaceholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {open && available.length > 0 && (
        <ul id={listboxId} role="listbox" className="company-tag-picker__list">
          {available.map((name, i) => (
            <li key={name} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={i === safeIdx}
                className={`company-tag-picker__option${i === safeIdx ? " company-tag-picker__option--active" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(name)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim() && available.length === 0 && !allSelected && (
        <div className="company-tag-picker__empty">{emptyFilterMessage}</div>
      )}
    </div>
  );
}

/* function CompanyTagPicker(props) {
  return (
    <MultiTagPicker
      {...props}
      allSelectedPlaceholder="All companies added"
      addPlaceholder="Type or click to add…"
      emptyFilterMessage="No matching companies"
    />
  );
} */

function DefaultAnnotationStylesView() {
  const dialogRef = useRef(/** @type {HTMLDialogElement | null} */ (null));
  const [dialogOpen, setDialogOpen] = useState(false);
  // const [companyPickerKey, setCompanyPickerKey] = useState(0);
  const [rows, setRows] = useState(() => createDefaultAnnotationRows());
  const [form, setForm] = useState(() => defaultFormState());
  const [editingCell, setEditingCell] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState(() => new Set());
  /** `index`: show row numbers; `checkbox`: show selection checkboxes (after user activates via row number). */
  const [selectionColumnMode, setSelectionColumnMode] = useState(/** @type {"index" | "checkbox"} */ ("index"));
  /* const [tablePairConflict, setTablePairConflict] = useState(null); */
  const selectAllRef = useRef(/** @type {HTMLInputElement | null} */ (null));

  /* const dialogPairConflicts = useMemo(() => {
    if (!dialogOpen) return [];
    return findPairConflicts(
      { annotationTypes: form.annotationTypes, companies: form.companies },
      rows,
      null
    );
  }, [dialogOpen, form.annotationTypes, form.companies, rows]);

  const conflictHighlightedRowIds = useMemo(() => {
    const s = new Set();
    for (const c of dialogPairConflicts) s.add(c.otherRowId);
    if (tablePairConflict) {
      tablePairConflict.otherRowIds.forEach((id) => s.add(id));
      s.add(tablePairConflict.sourceRowId);
    }
    return s;
  }, [dialogPairConflicts, tablePairConflict]); */

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (dialogOpen) {
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [dialogOpen]);

  const allRowsSelected = rows.length > 0 && rows.every((r) => selectedRowIds.has(r.id));
  const someRowsSelected = selectedRowIds.size > 0 && !allRowsSelected;

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someRowsSelected;
  }, [someRowsSelected, rows.length, selectedRowIds]);

  useEffect(() => {
    setSelectedRowIds((prev) => {
      const next = new Set([...prev].filter((id) => rows.some((r) => r.id === id)));
      return next.size === prev.size && [...next].every((id) => prev.has(id)) ? prev : next;
    });
  }, [rows]);

  useEffect(() => {
    if (selectionColumnMode === "checkbox" && selectedRowIds.size === 0) {
      setSelectionColumnMode("index");
    }
  }, [selectionColumnMode, selectedRowIds]);

  useEffect(() => {
    if (editingCell && !rows.some((r) => r.id === editingCell.rowId)) {
      setEditingCell(null);
    }
  }, [rows, editingCell]);

  function toggleRowSelected(id) {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function activateSelectionColumnFromRow(rowId) {
    setSelectionColumnMode("checkbox");
    setSelectedRowIds(new Set([rowId]));
  }

  function toggleSelectAll() {
    if (rows.length === 0) return;
    if (allRowsSelected) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(rows.map((r) => r.id)));
    }
  }

  function deleteSelectedRows() {
    if (selectedRowIds.size === 0) return;
    const toDelete = new Set(selectedRowIds);
    setRows((prev) => prev.filter((r) => !toDelete.has(r.id)));
    if (editingCell && toDelete.has(editingCell.rowId)) {
      setEditingCell(null);
    }
    setSelectedRowIds(new Set());
    /* setTablePairConflict(null); */
  }

  function openDialog() {
    setForm(defaultFormState());
    /* setCompanyPickerKey((k) => k + 1); */
    /* setTablePairConflict(null); */
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  function handleAddSubmit(e) {
    e.preventDefault();
    /* const addConflicts = findPairConflicts(
      { annotationTypes: form.annotationTypes, companies: form.companies },
      rows,
      null
    );
    if (addConflicts.length) return; */
    setRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        annotationTypes: [...form.annotationTypes],
        fillColor: form.fillColor,
        fillOpacity: form.fillOpacity,
        strokeColor: form.strokeColor,
        strokeOpacity: form.strokeOpacity,
        borderStyle: form.borderStyle,
        strokeWeight: normalizeStrokeWeight(form.strokeWeight),
        /* companies: [...form.companies], */
      },
    ]);
    closeDialog();
  }

  function patchRow(rowId, patch) {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
  }

  /* function tryPatchRowPairs(rowId, patch) {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;
    const candidate = { ...row, ...patch };
    const conflicts = findPairConflicts(candidate, rows, rowId);
    if (conflicts.length) {
      setTablePairConflict({
        sourceRowId: rowId,
        otherRowIds: [...new Set(conflicts.map((c) => c.otherRowId))],
        summary: formatConflictPairs(conflicts),
      });
      return;
    }
    setTablePairConflict(null);
    patchRow(rowId, patch);
  } */

  function isCellEditing(rowId, field) {
    return editingCell !== null && editingCell.rowId === rowId && editingCell.field === field;
  }

  function openCellEditor(rowId, field) {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;
    if (field === "fillOpacity") {
      setEditingCell({ rowId, field: "fillOpacity", draft: row.fillOpacity });
    } else if (field === "strokeOpacity") {
      setEditingCell({ rowId, field: "strokeOpacity", draft: row.strokeOpacity });
    } else {
      setEditingCell({ rowId, field });
    }
  }

  function commitOpacityFromCell(rowId, field) {
    setEditingCell((ec) => {
      if (ec && ec.rowId === rowId && ec.field === field && typeof ec.draft === "number") {
        const clamped = Math.min(100, Math.max(0, ec.draft));
        patchRow(rowId, { [field]: clamped });
      }
      return null;
    });
  }

  function colorHex(label) {
    return COLOR_OPTIONS.find((c) => c.label === label)?.hex ?? "#999";
  }

  return (
    <div className="annotation-styles">
      <div className="annotation-styles__title-row">
        <h2 id="annotation-styles-heading" className="annotation-styles__title">
          Default Annotation Styles
        </h2>
        <span className="annotation-styles__info-wrap">
          <button
            type="button"
            className="annotation-styles-info-btn"
            aria-label="About default annotation styles"
            aria-describedby="annotation-styles-tooltip"
          >
            <IconInfoCircle />
          </button>
          <span id="annotation-styles-tooltip" className="annotation-styles-tooltip" role="tooltip">
            {/* These styles will apply to all users of the specified companies when they login to the project/portfolio. Users can still change the style. */}
            These styles apply when users work with annotations in this project. Users can still change the style.
          </span>
        </span>
      </div>

      {/* {tablePairConflict && (
        <div className="rule-conflict-banner" role="alert">
          Each annotation type and company can only appear in one rule. Conflicting combinations: {tablePairConflict.summary}.
          The highlighted rows include the rule you are editing and the rule(s) that already use this pairing.
        </div>
      )} */}

      <div className={`table-card${editingCell ? " table-card--editing" : ""}`}>
        <div className="table-card__toolbar">
          <button
            type="button"
            className="table-trash-btn"
            disabled={selectedRowIds.size === 0}
            onClick={deleteSelectedRows}
            aria-label="Delete selected rows"
          >
            <IconTrash />
          </button>
          <button type="button" className="table-add-btn" onClick={openDialog} aria-label="Add annotation style">
            <IconPlus />
          </button>
        </div>
        <div className={`table-wrap${editingCell ? " table-wrap--editing" : ""}`}>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col" className="data-table__th-select">
                  {selectionColumnMode === "checkbox" ? (
                    <>
                      <span className="visually-hidden">Select rows</span>
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        className="data-table__checkbox"
                        checked={allRowsSelected}
                        onChange={toggleSelectAll}
                        disabled={rows.length === 0}
                        aria-label="Select all rows"
                      />
                    </>
                  ) : (
                    <>
                      <span className="visually-hidden">Row number</span>
                      <span className="data-table__th-index" aria-hidden>
                        #
                      </span>
                    </>
                  )}
                </th>
                {ANNOTATION_TABLE_COLUMNS.map((col) => (
                  <th key={col} scope="col">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="data-table__empty">
                    No rows yet. Use + to add a style.
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={[
                      editingCell?.rowId === row.id && editingCell?.field === "annotationTypes"
                        ? "data-table__row--cell-edit"
                        : "",
                      /* conflictHighlightedRowIds.has(row.id) ? "data-table__row--rule-conflict" : "", */
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined}
                  >
                    <td className="data-table__td-select">
                      {selectionColumnMode === "checkbox" ? (
                        <input
                          type="checkbox"
                          className="data-table__checkbox"
                          checked={selectedRowIds.has(row.id)}
                          onChange={() => toggleRowSelected(row.id)}
                          aria-label={`Select row ${rowAnnotationTypes(row).join(", ")}`}
                        />
                      ) : (
                        <button
                          type="button"
                          className="data-table__row-index-btn"
                          onClick={() => activateSelectionColumnFromRow(row.id)}
                          aria-label={`Row ${rowIndex + 1}, select rows for deletion`}
                        >
                          {rowIndex + 1}
                        </button>
                      )}
                    </td>
                    <td>
                      {isCellEditing(row.id, "annotationTypes") ? (
                        <div
                          className="table-cell-company-editor"
                          tabIndex={-1}
                          onBlur={(e) => {
                            const next = e.relatedTarget;
                            if (next instanceof Node && e.currentTarget.contains(next)) return;
                            setEditingCell(null);
                          }}
                        >
                          <span className="visually-hidden" id={`annotation-types-cell-label-${row.id}`}>
                            Annotation types
                          </span>
                          <MultiTagPicker
                            compact
                            id={`annotation-types-cell-${row.id}`}
                            labelledBy={`annotation-types-cell-label-${row.id}`}
                            options={ANNOTATION_TYPE_OPTIONS}
                            value={rowAnnotationTypes(row)}
                            onChange={(annotationTypes) => patchRow(row.id, { annotationTypes })}
                            allSelectedPlaceholder="All types added"
                            addPlaceholder="Type or click to add…"
                            emptyFilterMessage="No matching types"
                          />
                        </div>
                      ) : (
                        <span
                          className="data-table__cell-value"
                          role="button"
                          tabIndex={0}
                          onClick={() => openCellEditor(row.id, "annotationTypes")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openCellEditor(row.id, "annotationTypes");
                            }
                          }}
                        >
                          {rowAnnotationTypes(row).length ? rowAnnotationTypes(row).join(", ") : "—"}
                        </span>
                      )}
                    </td>
                    <td>
                      {isCellEditing(row.id, "fillColor") ? (
                        <div className="table-inline-color">
                          <span className="color-dot" style={{ background: colorHex(row.fillColor) }} aria-hidden />
                          <select
                            autoFocus
                            className="table-inline-select"
                            value={row.fillColor}
                            onChange={(e) => {
                              patchRow(row.id, { fillColor: e.target.value });
                              setEditingCell(null);
                            }}
                            onBlur={() => setEditingCell(null)}
                            aria-label="Fill color"
                          >
                            {COLOR_OPTIONS.map((opt) => (
                              <option key={opt.label} value={opt.label}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span
                          className="data-table__cell-value cell-color"
                          role="button"
                          tabIndex={0}
                          onClick={() => openCellEditor(row.id, "fillColor")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openCellEditor(row.id, "fillColor");
                            }
                          }}
                        >
                          <span className="color-dot" style={{ background: colorHex(row.fillColor) }} aria-hidden />
                          {row.fillColor}
                        </span>
                      )}
                    </td>
                    <td>
                      {isCellEditing(row.id, "fillOpacity") ? (
                        <input
                          autoFocus
                          className="table-inline-number"
                          type="number"
                          min={0}
                          max={100}
                          value={editingCell?.field === "fillOpacity" ? editingCell.draft : row.fillOpacity}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            setEditingCell((ec) =>
                              ec && ec.rowId === row.id && ec.field === "fillOpacity"
                                ? { ...ec, draft: Number.isFinite(v) ? v : 0 }
                                : ec
                            );
                          }}
                          onBlur={() => commitOpacityFromCell(row.id, "fillOpacity")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commitOpacityFromCell(row.id, "fillOpacity");
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              setEditingCell(null);
                            }
                          }}
                          aria-label="Fill opacity percent"
                        />
                      ) : (
                        <span
                          className="data-table__cell-value"
                          role="button"
                          tabIndex={0}
                          onClick={() => openCellEditor(row.id, "fillOpacity")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openCellEditor(row.id, "fillOpacity");
                            }
                          }}
                        >
                          {row.fillOpacity}%
                        </span>
                      )}
                    </td>
                    <td>
                      {isCellEditing(row.id, "strokeColor") ? (
                        <div className="table-inline-color">
                          <span className="color-dot" style={{ background: colorHex(row.strokeColor) }} aria-hidden />
                          <select
                            autoFocus
                            className="table-inline-select"
                            value={row.strokeColor}
                            onChange={(e) => {
                              patchRow(row.id, { strokeColor: e.target.value });
                              setEditingCell(null);
                            }}
                            onBlur={() => setEditingCell(null)}
                            aria-label="Stroke color"
                          >
                            {COLOR_OPTIONS.map((opt) => (
                              <option key={opt.label} value={opt.label}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span
                          className="data-table__cell-value cell-color"
                          role="button"
                          tabIndex={0}
                          onClick={() => openCellEditor(row.id, "strokeColor")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openCellEditor(row.id, "strokeColor");
                            }
                          }}
                        >
                          <span className="color-dot" style={{ background: colorHex(row.strokeColor) }} aria-hidden />
                          {row.strokeColor}
                        </span>
                      )}
                    </td>
                    <td>
                      {isCellEditing(row.id, "strokeOpacity") ? (
                        <input
                          autoFocus
                          className="table-inline-number"
                          type="number"
                          min={0}
                          max={100}
                          value={editingCell?.field === "strokeOpacity" ? editingCell.draft : row.strokeOpacity}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            setEditingCell((ec) =>
                              ec && ec.rowId === row.id && ec.field === "strokeOpacity"
                                ? { ...ec, draft: Number.isFinite(v) ? v : 0 }
                                : ec
                            );
                          }}
                          onBlur={() => commitOpacityFromCell(row.id, "strokeOpacity")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commitOpacityFromCell(row.id, "strokeOpacity");
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              setEditingCell(null);
                            }
                          }}
                          aria-label="Stroke opacity percent"
                        />
                      ) : (
                        <span
                          className="data-table__cell-value"
                          role="button"
                          tabIndex={0}
                          onClick={() => openCellEditor(row.id, "strokeOpacity")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openCellEditor(row.id, "strokeOpacity");
                            }
                          }}
                        >
                          {row.strokeOpacity}%
                        </span>
                      )}
                    </td>
                    {/* Company column (commented out)
                    <td>
                      {isCellEditing(row.id, "companies") ? (
                        <div
                          className="table-cell-company-editor"
                          tabIndex={-1}
                          onBlur={(e) => {
                            const next = e.relatedTarget;
                            if (next instanceof Node && e.currentTarget.contains(next)) return;
                            setEditingCell(null);
                          }}
                        >
                          <span className="visually-hidden" id={`company-cell-label-${row.id}`}>
                            Company
                          </span>
                          <CompanyTagPicker
                            compact
                            id={`company-cell-${row.id}`}
                            labelledBy={`company-cell-label-${row.id}`}
                            options={COMPANY_OPTIONS}
                            value={row.companies}
                            onChange={(companies) => tryPatchRowPairs(row.id, { companies })}
                          />
                        </div>
                      ) : (
                        <span
                          className="data-table__cell-value"
                          role="button"
                          tabIndex={0}
                          onClick={() => openCellEditor(row.id, "companies")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openCellEditor(row.id, "companies");
                            }
                          }}
                        >
                          {row.companies.length ? row.companies.join(", ") : "—"}
                        </span>
                      )}
                    </td>
                    */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="add-style-dialog"
        aria-labelledby="add-style-dialog-title"
        onClose={closeDialog}
      >
        <div className="dialog-panel">
          <h3 id="add-style-dialog-title" className="dialog-title">
            New annotation style
          </h3>
          <form className="dialog-form" onSubmit={handleAddSubmit}>
            <div className="dialog-select-wrap">
              <span className="dialog-legend" id="annotation-types-label">
                Annotation Type
              </span>
              <MultiTagPicker
                id="annotation-types-input"
                labelledBy="annotation-types-label"
                options={ANNOTATION_TYPE_OPTIONS}
                value={form.annotationTypes}
                onChange={(annotationTypes) => setForm((f) => ({ ...f, annotationTypes }))}
                allSelectedPlaceholder="All types added"
                addPlaceholder="Type or click to add…"
                emptyFilterMessage="No matching types"
              />
            </div>

            <div className="dialog-select-wrap">
              <span className="dialog-legend" id="fill-color-label">
                Fill Color
              </span>
              <div className="dialog-select-with-swatch">
                <span className="color-dot" style={{ background: colorHex(form.fillColor) }} aria-hidden />
                <select
                  className="dialog-select"
                  aria-labelledby="fill-color-label"
                  value={form.fillColor}
                  onChange={(e) => setForm((f) => ({ ...f, fillColor: e.target.value }))}
                >
                  {COLOR_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dialog-opacity-block">
              <span className="dialog-legend" id="fill-opacity-legend">
                Fill Opacity
              </span>
              <div className="dialog-opacity-row">
                <input
                  type="range"
                  className="dialog-opacity-slider"
                  min={0}
                  max={100}
                  value={form.fillOpacity}
                  onChange={(e) => setForm((f) => ({ ...f, fillOpacity: Number(e.target.value) }))}
                  aria-labelledby="fill-opacity-legend"
                />
                <div className="dialog-opacity-number-wrap">
                  <input
                    type="number"
                    className="dialog-opacity-number"
                    min={0}
                    max={100}
                    value={form.fillOpacity}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setForm((f) => ({ ...f, fillOpacity: 0 }));
                        return;
                      }
                      const v = parseInt(raw, 10);
                      if (!Number.isFinite(v)) return;
                      setForm((f) => ({ ...f, fillOpacity: Math.min(100, Math.max(0, v)) }));
                    }}
                    aria-labelledby="fill-opacity-legend"
                  />
                  <span className="dialog-opacity-suffix" aria-hidden>
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="dialog-select-wrap">
              <span className="dialog-legend" id="stroke-color-label">
                Stroke Color
              </span>
              <div className="dialog-select-with-swatch">
                <span className="color-dot" style={{ background: colorHex(form.strokeColor) }} aria-hidden />
                <select
                  className="dialog-select"
                  aria-labelledby="stroke-color-label"
                  value={form.strokeColor}
                  onChange={(e) => setForm((f) => ({ ...f, strokeColor: e.target.value }))}
                >
                  {COLOR_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dialog-opacity-block">
              <span className="dialog-legend" id="stroke-opacity-legend">
                Stroke Opacity
              </span>
              <div className="dialog-opacity-row">
                <input
                  type="range"
                  className="dialog-opacity-slider"
                  min={0}
                  max={100}
                  value={form.strokeOpacity}
                  onChange={(e) => setForm((f) => ({ ...f, strokeOpacity: Number(e.target.value) }))}
                  aria-labelledby="stroke-opacity-legend"
                />
                <div className="dialog-opacity-number-wrap">
                  <input
                    type="number"
                    className="dialog-opacity-number"
                    min={0}
                    max={100}
                    value={form.strokeOpacity}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setForm((f) => ({ ...f, strokeOpacity: 0 }));
                        return;
                      }
                      const v = parseInt(raw, 10);
                      if (!Number.isFinite(v)) return;
                      setForm((f) => ({ ...f, strokeOpacity: Math.min(100, Math.max(0, v)) }));
                    }}
                    aria-labelledby="stroke-opacity-legend"
                  />
                  <span className="dialog-opacity-suffix" aria-hidden>
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="dialog-select-wrap">
              <span className="dialog-legend" id="border-style-label">
                Border Style
              </span>
              <select
                className="dialog-select"
                aria-labelledby="border-style-label"
                value={form.borderStyle}
                onChange={(e) => setForm((f) => ({ ...f, borderStyle: e.target.value }))}
              >
                {BORDER_STYLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="dialog-opacity-block">
              <span className="dialog-legend" id="stroke-weight-legend">
                Stroke Weight
              </span>
              <div className="dialog-opacity-row">
                <input
                  type="range"
                  className="dialog-opacity-slider"
                  min={STROKE_WEIGHT_MIN}
                  max={STROKE_WEIGHT_MAX}
                  step={0.01}
                  value={normalizeStrokeWeight(form.strokeWeight)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, strokeWeight: normalizeStrokeWeight(Number(e.target.value)) }))
                  }
                  aria-labelledby="stroke-weight-legend"
                />
                <div className="dialog-opacity-number-wrap">
                  <input
                    type="number"
                    className="dialog-opacity-number dialog-opacity-number--weight"
                    min={STROKE_WEIGHT_MIN}
                    max={STROKE_WEIGHT_MAX}
                    step={0.01}
                    value={form.strokeWeight}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setForm((f) => ({ ...f, strokeWeight: STROKE_WEIGHT_MIN }));
                        return;
                      }
                      const v = parseFloat(raw);
                      if (!Number.isFinite(v)) return;
                      setForm((f) => ({ ...f, strokeWeight: normalizeStrokeWeight(v) }));
                    }}
                    aria-labelledby="stroke-weight-legend"
                  />
                  <span className="dialog-opacity-suffix" aria-hidden>
                    pt
                  </span>
                </div>
              </div>
            </div>

            {/* Company field (commented out)
            <div className={`dialog-select-wrap${dialogPairConflicts.length ? " dialog-select-wrap--conflict" : ""}`}>
              <span className="dialog-legend" id="company-label">
                Company
              </span>
              <CompanyTagPicker
                key={companyPickerKey}
                id="company-tag-input"
                labelledBy="company-label"
                options={COMPANY_OPTIONS}
                value={form.companies}
                onChange={(companies) => setForm((f) => ({ ...f, companies }))}
              />
            </div>

            {dialogPairConflicts.length > 0 && (
              <div className="dialog-conflict-alert" role="alert">
                Each annotation type and company can only appear in one rule. Conflicting combinations:{" "}
                {formatConflictPairs(dialogPairConflicts)}. Adjust your selections or change the highlighted rule in the
                table.
              </div>
            )}
            */}

            <div className="dialog-actions">
              <button type="button" className="btn btn--ghost" onClick={closeDialog}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary">
                Add
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState("Default Annotation Styles");

  return (
    <div className="app">
      <header className="top-bar">
        <div className="top-bar__left">
          <LogoMark />
          <span className="brand">ProjectSight</span>
        </div>
        <div className="top-bar__center">Westminster Office Campus</div>
        <div className="top-bar__right">
          <button type="button" className="icon-btn" aria-label="Help">
            <IconHelp />
          </button>
          <button type="button" className="icon-btn" aria-label="Notifications">
            <IconBell />
          </button>
          <button type="button" className="avatar-btn" aria-label="Account">
            <span className="avatar" />
          </button>
        </div>
      </header>

      <div className="sub-header">
        <h1 className="sub-header__title">Project settings - Drawings</h1>
        <span className="sub-header__lock" title="Locked">
          <IconLock />
        </span>
      </div>

      <div className="body">
        <aside className="sidebar">
          <nav className="sidebar__nav" aria-label="Project settings">
            <ul>
              {NAV_ITEMS.map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    className={label === activeNav ? "nav-link nav-link--active" : "nav-link"}
                    onClick={() => setActiveNav(label)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <button type="button" className="back-btn">
            <IconChevronLeft />
            Back
          </button>
        </aside>

        <main className="main">
          {activeNav === "Default Annotation Styles" ? (
            <DefaultAnnotationStylesView />
          ) : (
            <p className="main__placeholder">to be built</p>
          )}
        </main>
      </div>
    </div>
  );
}
