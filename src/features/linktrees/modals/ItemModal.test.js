import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ItemModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockItem = {
    id: 10,
    title: "GitHub Profile",
    url: "https://github.com/octocat",
  };

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: false, linkTreeId: 1 },
    });

    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should render Add mode when item prop is null", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
    });

    expect(wrapper.text()).toContain("Tambah Item Tautan Baru");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("");
  });

  it("should render Edit mode when item prop is provided", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem },
    });

    expect(wrapper.text()).toContain("Ubah Item Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe(mockItem.title);
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe(mockItem.url);
  });

  it("should validate empty title", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Judul tautan tidak boleh kosong");
  });

  it("should validate empty url", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
    });

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    await titleInput.setValue("Valid Title");

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("URL tautan tidak boleh kosong");
  });

  it("should call asyncSetIsItemAdd when saving new item", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null },
    });

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    await titleInput.setValue("Portfolio");

    const urlInput = wrapper.find('[data-testid="item-url-input"]');
    await urlInput.setValue("https://example.com");

    const addSpy = vi.spyOn(linkTreesStore, "asyncSetIsItemAdd").mockImplementation(() => {});

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(addSpy).toHaveBeenCalledWith(1, "Portfolio", "https://example.com");
  });

  it("should call asyncSetIsItemChange when saving existing item", async () => {
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem },
    });

    const titleInput = wrapper.find('[data-testid="item-title-input"]');
    await titleInput.setValue("Updated Portfolio");

    const changeSpy = vi.spyOn(linkTreesStore, "asyncSetIsItemChange").mockImplementation(() => {});

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, 10, "Updated Portfolio", "https://github.com/octocat");
  });

  it("should handle close button and cancel button", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    const closeBtn = wrapper.find('[data-testid="close-item-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalled();

    const cancelBtn = wrapper.find('[data-testid="cancel-item-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should close on successful item add", async () => {
    const closeSpy = vi.fn();
    const { linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: null, onClose: closeSpy },
    });

    linkTreesStore.setIsItemAdded(true);
    linkTreesStore.setIsItemAdd(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should close on successful item change", async () => {
    const closeSpy = vi.fn();
    const { linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem, onClose: closeSpy },
    });

    linkTreesStore.setIsItemChanged(true);
    linkTreesStore.setIsItemChange(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });
});
