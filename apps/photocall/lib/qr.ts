import QRCode from "qrcode";

export async function generateQRCode(data: string, size = 256): Promise<string> {
	return QRCode.toDataURL(data, {
		width: size,
		margin: 2,
		color: {
			dark: "#000000",
			light: "#ffffff",
		},
	});
}

export async function generateQRCodeSvg(data: string): Promise<string> {
	return QRCode.toString(data, {
		type: "svg",
		margin: 2,
	});
}
