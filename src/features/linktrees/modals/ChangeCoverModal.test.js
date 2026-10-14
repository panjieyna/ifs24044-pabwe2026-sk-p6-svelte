import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeCoverModal from "./ChangeCoverModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockLinkTree = { id: 1, title: "Sample Link Tree" };

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: false, linkTree: mockLinkTree },
    });

    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);
  });

  it("should validate non-image file selection", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const textFile = new File(["dummy"], "file.txt", { type: "text/plain" });

    Object.defineProperty(fileInput.element, "files", {
      value: [textFile],
      configurable: true,
    });
    await fileInput.trigger("change");

    expect(errorSpy).toHaveBeenCalledWith("Pilih file gambar (JPG/PNG)!");
  });

  it("should validate file exceeding 1MB", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const largeFile = new File(["dummy"], "large.png", { type: "image/png" });
    Object.defineProperty(largeFile, "size", { value: 2 * 1024 * 1024 });

    Object.defineProperty(fileInput.element, "files", {
      value: [largeFile],
      configurable: true,
    });
    await fileInput.trigger("change");

    expect(errorSpy).toHaveBeenCalledWith("Ukuran gambar maksimal 1MB!");
  });

  it("should show error when submitting without selecting a file", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Silakan pilih cover baru!");
  });

  it("should handle valid file selection and submit cover change", async () => {
    window.URL.createObjectURL = vi.fn().mockReturnValue("blob:preview-url");

    const { wrapper, linkTreesStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    const validImage = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
    Object.defineProperty(validImage, "size", { value: 500 * 1024 });

    Object.defineProperty(fileInput.element, "files", {
      value: [validImage],
      configurable: true,
    });
    await fileInput.trigger("change");

    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);

    const changeCoverSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeChangeCover")
      .mockImplementation(() => {});

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeCoverSpy).toHaveBeenCalledWith(1, validImage);
  });

  it("should handle close button, cancel button, and success reaction", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree, onClose: closeSpy },
    });

    const closeBtn = wrapper.find('[data-testid="close-cover-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalled();

    const cancelBtn = wrapper.find('[data-testid="cancel-cover-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);

    linkTreesStore.setIsLinkTreeChangedCover(true);
    linkTreesStore.setIsLinkTreeChangeCover(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalledTimes(3);
  });

  it("should ignore empty files event", async () => {
    const { wrapper } = renderWithProviders(ChangeCoverModal, {
      props: { show: true, linkTree: mockLinkTree },
    });

    const fileInput = wrapper.find('[data-testid="cover-file-input"]');
    Object.defineProperty(fileInput.element, "files", {
      value: [],
      configurable: true,
    });
    await fileInput.trigger("change");
  });
});
