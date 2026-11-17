import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderTree,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/apiClient";

export function OccupationsPage() {
  const [occupations, setOccupations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Selected Occupation for viewing its specializations
  const [selectedOccupation, setSelectedOccupation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals / Dialog state for Occupation
  const [occModalOpen, setOccModalOpen] = useState(false);
  const [editingOcc, setEditingOcc] = useState(null);
  const [occNameInput, setOccNameInput] = useState("");
  const [occSubmitting, setOccSubmitting] = useState(false);

  // Modals / Dialog state for Specialization
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [specNameInput, setSpecNameInput] = useState("");
  const [specSubmitting, setSpecSubmitting] = useState(false);

  const fetchOccupations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/occupations");
      const data = res.data?.data || [];
      setOccupations(data);
      if (data.length > 0) {
        setSelectedOccupation((prev) => {
          if (!prev) return data[0];
          const found = data.find((o) => o.occupationId === prev.occupationId);
          return found || data[0];
        });
      } else {
        setSelectedOccupation(null);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh mục ngành nghề:", err);
      setError(
        err.response?.data?.message ||
        "Không thể kết nối đến Job Service. Vui lòng kiểm tra API Gateway."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOccupations();
  }, [fetchOccupations]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // --- OCCUPATION HANDLERS ---
  const handleOpenAddOcc = () => {
    setEditingOcc(null);
    setOccNameInput("");
    setOccModalOpen(true);
  };

  const handleOpenEditOcc = (occ, e) => {
    e.stopPropagation();
    setEditingOcc(occ);
    setOccNameInput(occ.occupationName);
    setOccModalOpen(true);
  };

  const handleSaveOcc = async (e) => {
    e.preventDefault();
    if (!occNameInput.trim()) return;

    setOccSubmitting(true);
    try {
      if (editingOcc) {
        await apiClient.patch(`/occupations/${editingOcc.occupationId}`, {
          occupationName: occNameInput.trim(),
        });
        showSuccess(`Đã cập nhật ngành nghề "${occNameInput.trim()}" thành công!`);
      } else {
        await apiClient.post("/occupations", {
          occupationName: occNameInput.trim(),
        });
        showSuccess(`Đã thêm ngành nghề "${occNameInput.trim()}" thành công!`);
      }
      setOccModalOpen(false);
      fetchOccupations();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Thao tác thất bại!");
    } finally {
      setOccSubmitting(false);
    }
  };

  const handleDeleteOcc = async (occ, e) => {
    e.stopPropagation();
    if (occ.specializations && occ.specializations.length > 0) {
      alert("Không thể xóa ngành nghề đang chứa chuyên ngành. Hãy xóa các chuyên ngành trước!");
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa ngành nghề "${occ.occupationName}"?`)) return;

    try {
      await apiClient.delete(`/occupations/${occ.occupationId}`);
      showSuccess(`Đã xóa ngành nghề thành công!`);
      fetchOccupations();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa ngành nghề!");
    }
  };

  // --- SPECIALIZATION HANDLERS ---
  const handleOpenAddSpec = () => {
    if (!selectedOccupation) return;
    setEditingSpec(null);
    setSpecNameInput("");
    setSpecModalOpen(true);
  };

  const handleOpenEditSpec = (spec) => {
    setEditingSpec(spec);
    setSpecNameInput(spec.specializationName);
    setSpecModalOpen(true);
  };

  const handleSaveSpec = async (e) => {
    e.preventDefault();
    if (!specNameInput.trim() || !selectedOccupation) return;

    setSpecSubmitting(true);
    try {
      if (editingSpec) {
        await apiClient.patch(`/specializations/${editingSpec.specializationId}`, {
          specializationName: specNameInput.trim(),
          occupationId: selectedOccupation.occupationId,
        });
        showSuccess(`Đã cập nhật chuyên ngành thành công!`);
      } else {
        await apiClient.post("/specializations", {
          specializationName: specNameInput.trim(),
          occupationId: selectedOccupation.occupationId,
        });
        showSuccess(`Đã thêm chuyên ngành mới thành công!`);
      }
      setSpecModalOpen(false);
      fetchOccupations();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Thao tác thất bại!");
    } finally {
      setSpecSubmitting(false);
    }
  };

  const handleDeleteSpec = async (spec) => {
    if (!confirm(`Bạn có chắc muốn xóa chuyên ngành "${spec.specializationName}"?`)) return;

    try {
      await apiClient.delete(`/specializations/${spec.specializationId}`);
      showSuccess(`Đã xóa chuyên ngành thành công!`);
      fetchOccupations();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể xóa chuyên ngành!");
    }
  };

  // Filtered specializations in right column
  const filteredSpecs = (selectedOccupation?.specializations || []).filter((s) =>
    s.specializationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Danh mục Ngành nghề & Chuyên môn</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản trị danh mục phân loại việc làm phục vụ bộ lọc tìm kiếm của ứng viên và nhà tuyển dụng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOccupations}
            disabled={loading}
            className="h-9 gap-1.5 text-xs shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
          <Button size="sm" onClick={handleOpenAddOcc} className="h-9 gap-1.5 text-xs font-semibold shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Thêm ngành nghề</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOccupations} className="h-7 text-xs">
            Thử lại
          </Button>
        </div>
      )}

      {/* 2-Column Layout: Occupations Left, Specializations Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Occupations (5 cols) */}
        <Card className="md:col-span-5 shadow-xs border-border/80 flex flex-col">
          <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-primary" />
                <span>Ngành nghề chính ({occupations.length})</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Chọn ngành nghề để xem các chuyên môn trực thuộc
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-2 space-y-1 overflow-y-auto max-h-[600px] flex-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <span>Đang tải danh mục ngành nghề...</span>
              </div>
            ) : occupations.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Chưa có ngành nghề nào. Nhấn "Thêm ngành nghề" để tạo mới.
              </div>
            ) : (
              occupations.map((occ) => {
                const isSelected = selectedOccupation?.occupationId === occ.occupationId;
                const specCount = occ.specializations?.length || 0;

                return (
                  <div
                    key={occ.occupationId}
                    onClick={() => setSelectedOccupation(occ)}
                    className={`flex items-center justify-between p-3 rounded-lg text-xs cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-primary/10 border-primary/30 text-primary font-semibold shadow-xs"
                        : "border-transparent hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Briefcase className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="truncate">{occ.occupationName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <Badge variant={isSelected ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4 font-mono">
                        {specCount}
                      </Badge>
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditOcc(occ, e)}
                        className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Sửa tên ngành"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteOcc(occ, e)}
                        className="p-1 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Xóa ngành"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Right Column: Specializations (7 cols) */}
        <Card className="md:col-span-7 shadow-xs border-border/80 flex flex-col">
          <CardHeader className="p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-500" />
                <span>Chuyên môn thuộc:</span>
                <span className="text-primary font-bold">
                  {selectedOccupation ? selectedOccupation.occupationName : "Chưa chọn"}
                </span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Danh sách các vị trí / chuyên môn con của ngành nghề này
              </CardDescription>
            </div>
            {selectedOccupation && (
              <Button size="sm" onClick={handleOpenAddSpec} className="h-8 gap-1.5 text-xs font-semibold shadow-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Thêm chuyên môn</span>
              </Button>
            )}
          </CardHeader>

          {/* Search Box in Column */}
          {selectedOccupation && (
            <div className="p-3 border-b border-border/60 bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Lọc chuyên môn trong ngành..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>
            </div>
          )}

          <CardContent className="p-3 space-y-1.5 overflow-y-auto max-h-[540px] flex-1">
            {!selectedOccupation ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                Vui lòng chọn một ngành nghề ở cột bên trái để quản lý các chuyên môn.
              </div>
            ) : filteredSpecs.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                Chưa có chuyên môn nào trong ngành này. Nhấn "Thêm chuyên môn" để bổ sung.
              </div>
            ) : (
              filteredSpecs.map((spec) => (
                <div
                  key={spec.specializationId}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:bg-muted/30 transition-all text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="font-medium text-foreground">{spec.specializationName}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditSpec(spec)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Sửa tên"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSpec(spec)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      title="Xóa"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Thêm / Sửa Ngành nghề */}
      {occModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <Card className="w-full max-w-sm shadow-2xl border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                {editingOcc ? "Chỉnh sửa ngành nghề" : "Thêm ngành nghề mới"}
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSaveOcc}>
              <CardContent className="space-y-3 pt-0">
                <div className="space-y-1">
                  <label className="text-xs font-semibold block">Tên ngành nghề:</label>
                  <Input
                    required
                    placeholder="VD: Công nghệ thông tin / Phần mềm"
                    value={occNameInput}
                    onChange={(e) => setOccNameInput(e.target.value)}
                    className="h-9 text-xs"
                    autoFocus
                  />
                </div>
              </CardContent>
              <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={occSubmitting}
                  onClick={() => setOccModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Hủy
                </Button>
                <Button type="submit" size="sm" disabled={occSubmitting} className="h-8 text-xs font-semibold">
                  {occSubmitting ? "Đang lưu..." : "Lưu ngành nghề"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal Thêm / Sửa Chuyên môn */}
      {specModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <Card className="w-full max-w-sm shadow-2xl border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                {editingSpec ? "Chỉnh sửa chuyên môn" : "Thêm chuyên môn mới"}
              </CardTitle>
              <CardDescription className="text-xs">
                Thuộc ngành: <span className="font-semibold text-foreground">{selectedOccupation?.occupationName}</span>
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveSpec}>
              <CardContent className="space-y-3 pt-0">
                <div className="space-y-1">
                  <label className="text-xs font-semibold block">Tên chuyên môn / vị trí:</label>
                  <Input
                    required
                    placeholder="VD: Lập trình viên React / Frontend"
                    value={specNameInput}
                    onChange={(e) => setSpecNameInput(e.target.value)}
                    className="h-9 text-xs"
                    autoFocus
                  />
                </div>
              </CardContent>
              <div className="p-4 bg-muted/30 border-t border-border flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={specSubmitting}
                  onClick={() => setSpecModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Hủy
                </Button>
                <Button type="submit" size="sm" disabled={specSubmitting} className="h-8 text-xs font-semibold">
                  {specSubmitting ? "Đang lưu..." : "Lưu chuyên môn"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default OccupationsPage;

