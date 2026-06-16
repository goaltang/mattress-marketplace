"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, X, Check, Loader2, MapPin, Star, ToggleLeft, ToggleRight, Pencil, Trash2 } from "lucide-react";

interface CityRow {
  id: string;
  name: string;
  slug: string;
  pinyin: string;
  pinyin_full: string | null;
  region: string | null;
  is_hot: boolean;
  district_label: string | null;
  is_active: boolean;
}

const REGIONS = ["华北", "华东", "华南", "华中", "西南", "西北", "东北"];

function AdminCitiesPage() {
  const [cities, setCities] = useState<CityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<CityRow | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", region: "", district_label: "", is_hot: false, is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (regionFilter) params.set("region", regionFilter);
      const res = await fetch(`/api/admin/cities?${params}`);
      const data = await res.json();
      if (data.success) setCities(data.cities);
    } catch {
      setError("加载城市列表失败");
    } finally {
      setLoading(false);
    }
  }, [search, regionFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchCities, 300);
    return () => clearTimeout(timer);
  }, [fetchCities]);

  const resetForm = () => {
    setFormData({ name: "", slug: "", region: "", district_label: "", is_hot: false, is_active: true });
    setEditingCity(null);
    setShowForm(false);
    setError("");
  };

  const openEdit = (city: CityRow) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      slug: city.slug,
      region: city.region || "",
      district_label: city.district_label || "",
      is_hot: city.is_hot,
      is_active: city.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      if (editingCity) {
        const res = await fetch(`/api/admin/cities/${editingCity.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            region: formData.region,
            district_label: formData.district_label,
            is_hot: formData.is_hot,
            is_active: formData.is_active,
          }),
        });
        const data = await res.json();
        if (!data.success) { setError(data.error); return; }
      } else {
        if (!formData.name || !formData.slug) { setError("城市名称和 slug 为必填"); return; }
        const res = await fetch("/api/admin/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!data.success) { setError(data.error); return; }
      }
      resetForm();
      fetchCities();
    } catch {
      setError("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (slug: string, field: "is_hot" | "is_active", value: boolean) => {
    setCities((prev) => prev.map((c) => c.slug === slug ? { ...c, [field]: value } : c));
    try {
      const res = await fetch(`/api/admin/cities/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (!data.success) {
        setCities((prev) => prev.map((c) => c.slug === slug ? { ...c, [field]: !value } : c));
      }
    } catch {
      setCities((prev) => prev.map((c) => c.slug === slug ? { ...c, [field]: !value } : c));
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`确定删除城市「${slug}」？此操作不可撤销。`)) return;
    try {
      const res = await fetch(`/api/admin/cities/${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCities((prev) => prev.filter((c) => c.slug !== slug));
      } else {
        setError(data.error);
      }
    } catch {
      setError("删除失败");
    }
  };

  const hotCount = cities.filter((c) => c.is_hot).length;
  const activeCount = cities.filter((c) => c.is_active).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      <header className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-black dark:text-white" />
            <div>
              <h1 className="text-xl font-bold text-black dark:text-white">城市管理</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                共 {cities.length} 个城市 · {activeCount} 个启用 · {hotCount} 个热门
              </p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors border-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            添加城市
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索城市名称、拼音或 slug..."
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-black dark:text-white placeholder-gray-400 outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
          >
            <option value="">全部地区</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-sm text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="border-0 bg-transparent cursor-pointer text-rose-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : cities.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">
              {search || regionFilter ? "未找到匹配的城市" : "暂无城市数据"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-neutral-800 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">城市</th>
                    <th className="px-4 py-3 font-semibold">Slug</th>
                    <th className="px-4 py-3 font-semibold">拼音</th>
                    <th className="px-4 py-3 font-semibold">地区</th>
                    <th className="px-4 py-3 font-semibold text-center">热门</th>
                    <th className="px-4 py-3 font-semibold text-center">启用</th>
                    <th className="px-4 py-3 font-semibold">区域标签</th>
                    <th className="px-4 py-3 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                  {cities.map((city) => (
                    <tr key={city.slug} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-black dark:text-white">{city.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{city.slug}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{city.pinyin}</td>
                      <td className="px-4 py-3">
                        {city.region && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 rounded text-xs">{city.region}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(city.slug, "is_hot", !city.is_hot)}
                          className="border-0 bg-transparent cursor-pointer p-1 transition-colors"
                          title={city.is_hot ? "取消热门" : "设为热门"}
                        >
                          {city.is_hot ? (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          ) : (
                            <Star className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(city.slug, "is_active", !city.is_active)}
                          className="border-0 bg-transparent cursor-pointer p-1 transition-colors"
                          title={city.is_active ? "停用" : "启用"}
                        >
                          {city.is_active ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-[150px] truncate">
                        {city.district_label || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(city)}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors border-0 bg-transparent cursor-pointer"
                            title="编辑"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(city.slug)}
                            className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors border-0 bg-transparent cursor-pointer"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}
        >
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-black dark:text-white">
                {editingCity ? "编辑城市" : "添加城市"}
              </h2>
              <button onClick={resetForm} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 border-0 bg-transparent cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">城市名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="如：杭州"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value.toLowerCase() }))}
                  placeholder="如：hangzhou"
                  disabled={!!editingCity}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">地区</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData((p) => ({ ...p, region: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer"
                >
                  <option value="">未分类</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">区域标签</label>
                <input
                  type="text"
                  value={formData.district_label}
                  onChange={(e) => setFormData((p) => ({ ...p, district_label: e.target.value }))}
                  placeholder="如：滨江与西湖"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_hot}
                    onChange={(e) => setFormData((p) => ({ ...p, is_hot: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">热门城市</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">启用</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer bg-transparent"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingCity ? "保存" : "添加"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCitiesPage;
