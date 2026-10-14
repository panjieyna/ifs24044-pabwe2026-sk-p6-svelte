import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: false },
    });

    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(false);
  });

  it("should render modal form when show is true", () => {
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-linktree-title-input"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-linktree-type-select"]').exists()).toBe(true);
  });

  it("should show error dialog when title is empty on save", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");
  });

  it("should show error dialog when description is empty on save", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const titleInput = wrapper.find('[data-testid="add-linktree-title-input"]');
    await titleInput.setValue("Valid Title");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should submit form and call asyncSetIsLinkTreeAdd when valid", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(AddModal, {
      props: { show: true },
    });

    const titleInput = wrapper.find('[data-testid="add-linktree-title-input"]');
    await titleInput.setValue("New Tree");

    const typeSelect = wrapper.find('[data-testid="add-linktree-type-select"]');
    await typeSelect.setValue("unlisted");

    const descInput = wrapper.find('[data-testid="add-linktree-description-input"]');
    await descInput.setValue("Detailed tree description");

    const addSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeAdd").mockImplementation(() => {});

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(addSpy).toHaveBeenCalledWith("New Tree", "unlisted", "Detailed tree description");
  });

  it("should handle close button, cancel button, and success reaction", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(AddModal, {
      props: { show: true, onClose: closeSpy },
    });

    const closeBtn = wrapper.find('[data-testid="close-add-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalled();

    const cancelBtn = wrapper.find('[data-testid="cancel-add-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);

    // Simulate success
    linkTreesStore.setIsLinkTreeAdded(true);
    linkTreesStore.setIsLinkTreeAdd(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalledTimes(3);
  });
});
