import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import { ThemeToggle } from "../modules/financial-grid/components/ThemeToggle";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../modules/financial-grid/services/financialGridService";
import { tokenStorageKey } from "../modules/financial-grid/hooks/useSession";
import type { ThemeMode } from "../modules/financial-grid/hooks/useTheme";
import type {
  CategoryOption,
  CategoryPayload,
  CategoryType,
} from "../modules/financial-grid/types/financialGrid.types";

type CategoriesOutletContext = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

const categoryTypes: Array<{ label: string; value: CategoryType }> = [
  { label: "Receita", value: "INCOME" },
  { label: "Despesa", value: "EXPENSE" },
  { label: "Ambos", value: "BOTH" },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseKeywords(value: string) {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function CategoriesPage() {
  const { theme, toggleTheme } = useOutletContext<CategoriesOutletContext>();
  const token = useMemo(() => localStorage.getItem(tokenStorageKey) ?? "", []);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [editing, setEditing] = useState<CategoryOption | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<CategoryType>("EXPENSE");
  const [color, setColor] = useState("#19C37D");
  const [icon, setIcon] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCategories() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      setCategories(await fetchCategories(token));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Falha ao carregar categorias.",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditing(null);
    setName("");
    setSlug("");
    setType("EXPENSE");
    setColor("#19C37D");
    setIcon("");
    setKeywords("");
  }

  function startEdit(category: CategoryOption) {
    setEditing(category);
    setName(category.name);
    setSlug(category.slug ?? slugify(category.name));
    setType((category.type as CategoryType) ?? "EXPENSE");
    setColor(category.color ?? "#19C37D");
    setIcon(category.icon ?? "");
    setKeywords((category.keywords ?? []).join(", "));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CategoryPayload = {
      name,
      slug: slug || slugify(name),
      type,
      color,
      ...(icon ? { icon } : {}),
      keywords: parseKeywords(keywords),
    };

    setSaving(true);
    setError("");

    try {
      if (editing) {
        await updateCategory(editing.id, payload, token);
      } else {
        await createCategory(payload, token);
      }

      resetForm();
      await loadCategories();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Falha ao salvar categoria.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: CategoryOption) {
    setSaving(true);
    setError("");

    try {
      await deleteCategory(category.id, token);
      await loadCategories();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Falha ao remover categoria.",
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">Cadastros</span>
          <h1>Categorias</h1>
        </div>
        <div className="topbar__actions">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {error ? <div className="alert">{error}</div> : null}

      <section className="management-grid">
        <form className="management-form" onSubmit={handleSubmit}>
          <div>
            <span className="eyebrow">
              {editing ? "Editar categoria" : "Nova categoria"}
            </span>
            <h2>{editing ? editing.name : "Criar categoria"}</h2>
          </div>

          <label className="field">
            <span>Nome</span>
            <input
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (!editing) {
                  setSlug(slugify(event.target.value));
                }
              }}
            />
          </label>

          <label className="field">
            <span>Slug</span>
            <input
              required
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
            />
          </label>

          <label className="field">
            <span>Tipo</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as CategoryType)}
            >
              {categoryTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Cor</span>
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Icone</span>
            <input
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              placeholder="home, tag, wallet..."
            />
          </label>

          <label className="field">
            <span>Palavras-chave</span>
            <input
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="obra, reforma, material"
            />
          </label>

          <div className="form-actions">
            {editing ? (
              <button
                className="button button--ghost"
                onClick={resetForm}
                type="button"
              >
                Cancelar
              </button>
            ) : null}
            <button className="button button--primary" disabled={saving}>
              {saving ? "Salvando..." : "Salvar categoria"}
            </button>
          </div>
        </form>

        <div className="management-table">
          <header>
            <div>
              <span className="eyebrow">Lista</span>
              <h2>Categorias cadastradas</h2>
            </div>
            <button
              className="button button--ghost"
              disabled={loading}
              onClick={loadCategories}
            >
              Atualizar
            </button>
          </header>

          <div className="table-scroll">
            <table className="transactions-table categories-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Slug</th>
                  <th>Origem</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="state-cell" colSpan={5}>
                      Carregando...
                    </td>
                  </tr>
                ) : null}

                {!loading && categories.length === 0 ? (
                  <tr>
                    <td className="state-cell" colSpan={5}>
                      Nenhuma categoria encontrada.
                    </td>
                  </tr>
                ) : null}

                {!loading
                  ? categories.map((category) => (
                      <tr key={category.id}>
                        <td>
                          <div className="category-name">
                            <span
                              className="category-color"
                              style={{
                                backgroundColor: category.color ?? "#19C37D",
                              }}
                            />
                            <strong>{category.name}</strong>
                          </div>
                        </td>
                        <td>{category.type ?? "-"}</td>
                        <td>{category.slug ?? "-"}</td>
                        <td>{category.isDefault ? "Padrao" : "Usuario"}</td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="button button--table"
                              onClick={() => startEdit(category)}
                            >
                              Editar
                            </button>
                            <button
                              className="button button--table button--danger"
                              disabled={Boolean(category.isDefault)}
                              onClick={() => handleDelete(category)}
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
