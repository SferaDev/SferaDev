import { describe, expect, it, vi } from "vitest";
import { downloadBlob } from "@/lib/canvas-utils";

describe("downloadBlob", () => {
	it("creates a link, triggers download, and cleans up", () => {
		const revokeObjectURL = vi.fn();
		const createObjectURL = vi.fn(() => "blob:http://localhost/fake-url");
		global.URL.createObjectURL = createObjectURL;
		global.URL.revokeObjectURL = revokeObjectURL;

		const click = vi.fn();
		const appendChild = vi.fn();
		const removeChild = vi.fn();
		const anchor = { href: "", download: "", click } as unknown as HTMLAnchorElement;

		vi.spyOn(document, "createElement").mockReturnValue(anchor as any);
		vi.spyOn(document.body, "appendChild").mockImplementation(appendChild);
		vi.spyOn(document.body, "removeChild").mockImplementation(removeChild);

		const blob = new Blob(["test"], { type: "image/jpeg" });
		downloadBlob(blob, "photo.jpg");

		expect(createObjectURL).toHaveBeenCalledWith(blob);
		expect(anchor.href).toBe("blob:http://localhost/fake-url");
		expect(anchor.download).toBe("photo.jpg");
		expect(click).toHaveBeenCalled();
		expect(appendChild).toHaveBeenCalledWith(anchor);
		expect(removeChild).toHaveBeenCalledWith(anchor);
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/fake-url");
	});
});
