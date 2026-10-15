import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import linkTreeApi from "../api/linkTreeApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLinkTree = {
    id: 1,
    title: "Existing Title",
    type: "private",
    description: "Existing Description",
  };

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: false, linkTreeId: 1 },
    });

    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
  });

  it("should load link tree data on open and populate inputs", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const titleInput = wrapper.find('[data-testid="edit-linktree-title-input"]');
    expect(titleInput.element.value).toBe("Existing Title");

    const typeSelect = wrapper.find('[data-testid="edit-linktree-type-select"]');
    expect(typeSelect.element.value).toBe("private");
  });

  it("should handle error when loading link tree data fails", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const closeSpy = vi.fn();
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("Network error"));

    renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(errorSpy).toHaveBeenCalledWith("Gagal mengambil data link tree");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should validate empty title", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({
      id: 1,
      title: "",
      type: "public",
      description: "Desc",
    });
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");
  });

  it("should validate empty description", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({
      id: 1,
      title: "Valid Title",
      type: "public",
      description: "",
    });
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should save changes and invoke asyncSetIsLinkTreeChange", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);

    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const titleInput = wrapper.find('[data-testid="edit-linktree-title-input"]');
    await titleInput.setValue("Updated Title");

    const descInput = wrapper.find('[data-testid="edit-linktree-description-input"]');
    await descInput.setValue("Updated Desc");

    const changeSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeChange").mockImplementation(() => {});

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, "Updated Title", "private", "Updated Desc");
  });

  it("should close on cancel, close button, and after successful update", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);
    const closeSpy = vi.fn();

    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    await new Promise((r) => setTimeout(r, 20));

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalled();

    const cancelBtn = wrapper.find('[data-testid="cancel-edit-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);

    linkTreesStore.setIsLinkTreeChanged(true);
    linkTreesStore.setIsLinkTreeChange(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalledTimes(3);
  });
  it("should keep default values when the API returns no link tree", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(null);

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.find('[data-testid="edit-linktree-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="edit-linktree-type-select"]').element.value).toBe("public");
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("should fall back to public type when the link tree has no type", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({
      id: 1,
      title: "No Type",
      description: "Some description",
    });

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.find('[data-testid="edit-linktree-title-input"]').element.value).toBe("No Type");
    expect(wrapper.find('[data-testid="edit-linktree-type-select"]').element.value).toBe("public");
  });

  it("should submit the visibility type selected by the user", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);

    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const typeSelect = wrapper.find('[data-testid="edit-linktree-type-select"]');
    await typeSelect.setValue("unlisted");

    const changeSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeChange").mockImplementation(() => {});

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, "Existing Title", "unlisted", "Existing Description");
  });

  it("should stay open when the change finished without being marked as changed", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);
    const closeSpy = vi.fn();

    const { linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    await new Promise((r) => setTimeout(r, 20));

    linkTreesStore.setIsLinkTreeChanged(false);
    linkTreesStore.setIsLinkTreeChange(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).not.toHaveBeenCalled();
    expect(linkTreesStore.$state.isLinkTreeChange).toBe(false);
  });
});
