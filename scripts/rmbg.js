#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { PNG } = require("pngjs");

function printUsage() {
	console.log(
		[
			"Usage:",
			"  node scripts/rmbg.js <input.png> [output.png] [--threshold=50] [--feather=20] [--edge-trim=4]",
			"",
			"Options:",
			"  --threshold=<number>  Background color tolerance (default: 50)",
			"  --feather=<number>    Soft edge range above threshold (default: 20)",
			"  --edge-trim=<number>  Extra alpha trim on edge pixels 0-64 (default: 4)",
			"",
			"Example:",
			"  node scripts/rmbg.js ./public/image.png ./public/image_nobg.png --threshold=60 --edge-trim=6",
		].join("\n"),
	);
}

function parseArgs(argv) {
	const positional = [];
	const options = {
		threshold: 50,
		feather: 20,
		edgeTrim: 4,
	};

	for (const arg of argv) {
		if (arg.startsWith("--threshold=")) {
			options.threshold = Number(arg.slice("--threshold=".length));
			continue;
		}

		if (arg.startsWith("--feather=")) {
			options.feather = Number(arg.slice("--feather=".length));
			continue;
		}

		if (arg.startsWith("--edge-trim=")) {
			options.edgeTrim = Number(arg.slice("--edge-trim=".length));
			continue;
		}

		if (arg === "-h" || arg === "--help") {
			options.help = true;
			continue;
		}

		positional.push(arg);
	}

	return {
		inputPath: positional[0],
		outputPath: positional[1],
		...options,
	};
}

function colorDistance(r1, g1, b1, r2, g2, b2) {
	const dr = r1 - r2;
	const dg = g1 - g2;
	const db = b1 - b2;
	return Math.sqrt(dr * dr + dg * dg + db * db);
}

function getAvgCornerColor(png) {
	const { width, height, data } = png;
	const sampleSize = Math.max(2, Math.floor(Math.min(width, height) * 0.05));

	const corners = [
		[0, 0],
		[width - sampleSize, 0],
		[0, height - sampleSize],
		[width - sampleSize, height - sampleSize],
	];

	let r = 0;
	let g = 0;
	let b = 0;
	let n = 0;

	for (const [startX, startY] of corners) {
		for (let y = startY; y < startY + sampleSize; y += 1) {
			for (let x = startX; x < startX + sampleSize; x += 1) {
				const i = (width * y + x) * 4;
				const a = data[i + 3];

				if (a === 0) {
					continue;
				}

				r += data[i];
				g += data[i + 1];
				b += data[i + 2];
				n += 1;
			}
		}
	}

	if (n === 0) {
		return { r: 255, g: 255, b: 255 };
	}

	return {
		r: Math.round(r / n),
		g: Math.round(g / n),
		b: Math.round(b / n),
	};
}

function removeBackground(png, threshold, feather, edgeTrim) {
	const { width, height, data } = png;
	const bg = getAvgCornerColor(png);
	const visited = new Uint8Array(width * height);
	const bgMask = new Uint8Array(width * height);
	const edgeMask = new Uint8Array(width * height);
	const queue = [];

	function pixelDistance(pixelIndex) {
		const i = pixelIndex * 4;
		return colorDistance(
			data[i],
			data[i + 1],
			data[i + 2],
			bg.r,
			bg.g,
			bg.b,
		);
	}

	function pushIfBackground(x, y) {
		if (x < 0 || y < 0 || x >= width || y >= height) {
			return;
		}

		const pixelIndex = width * y + x;
		if (visited[pixelIndex] === 1) {
			return;
		}

		visited[pixelIndex] = 1;
		const i = pixelIndex * 4;
		const alpha = data[i + 3];

		if (alpha === 0) {
			bgMask[pixelIndex] = 1;
			queue.push(pixelIndex);
			return;
		}

		if (pixelDistance(pixelIndex) <= threshold) {
			bgMask[pixelIndex] = 1;
			queue.push(pixelIndex);
		}
	}

	for (let x = 0; x < width; x += 1) {
		pushIfBackground(x, 0);
		pushIfBackground(x, height - 1);
	}

	for (let y = 0; y < height; y += 1) {
		pushIfBackground(0, y);
		pushIfBackground(width - 1, y);
	}

	let head = 0;
	while (head < queue.length) {
		const pixelIndex = queue[head];
		head += 1;

		const x = pixelIndex % width;
		const y = Math.floor(pixelIndex / width);

		pushIfBackground(x - 1, y);
		pushIfBackground(x + 1, y);
		pushIfBackground(x, y - 1);
		pushIfBackground(x, y + 1);
	}

	for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex += 1) {
		if (bgMask[pixelIndex] === 1) {
			continue;
		}

		const x = pixelIndex % width;
		const y = Math.floor(pixelIndex / width);

		const neighbors = [
			[x - 1, y],
			[x + 1, y],
			[x, y - 1],
			[x, y + 1],
		];

		for (const [nx, ny] of neighbors) {
			if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
				continue;
			}

			const nIndex = width * ny + nx;
			if (bgMask[nIndex] === 1) {
				edgeMask[pixelIndex] = 1;
				break;
			}
		}
	}

	for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex += 1) {
		const i = pixelIndex * 4;
		const originalAlpha = data[i + 3];

		if (originalAlpha === 0) {
			continue;
		}

		if (bgMask[pixelIndex] === 1) {
			data[i + 3] = 0;
			continue;
		}

		if (edgeMask[pixelIndex] !== 1) {
			continue;
		}

		const dist = pixelDistance(pixelIndex);
		const blend = (dist - threshold) / Math.max(1, feather);
		const clamped = Math.max(0, Math.min(1, blend));
		const trimmedAlpha = Math.max(0, Math.round(originalAlpha * clamped) - edgeTrim);
		data[i + 3] = trimmedAlpha;

		if (trimmedAlpha > 0 && trimmedAlpha < 255) {
			const a = trimmedAlpha / 255;
			const invA = 1 - a;

			// Remove white fringe by unmixing known background color from semi-transparent edge pixels.
			data[i] = Math.max(
				0,
				Math.min(255, Math.round((data[i] - bg.r * invA) / Math.max(a, 0.001))),
			);
			data[i + 1] = Math.max(
				0,
				Math.min(255, Math.round((data[i + 1] - bg.g * invA) / Math.max(a, 0.001))),
			);
			data[i + 2] = Math.max(
				0,
				Math.min(255, Math.round((data[i + 2] - bg.b * invA) / Math.max(a, 0.001))),
			);
		}
	}

	return png;
}

async function main() {
	const args = parseArgs(process.argv.slice(2));

	if (args.help || !args.inputPath) {
		printUsage();
		process.exit(args.help ? 0 : 1);
	}

	if (!Number.isFinite(args.threshold) || args.threshold < 0) {
		throw new Error("--threshold must be a non-negative number.");
	}

	if (!Number.isFinite(args.feather) || args.feather < 0) {
		throw new Error("--feather must be a non-negative number.");
	}

	if (!Number.isFinite(args.edgeTrim) || args.edgeTrim < 0 || args.edgeTrim > 64) {
		throw new Error("--edge-trim must be a number between 0 and 64.");
	}

	const inputPath = path.resolve(args.inputPath);
	const ext = path.extname(inputPath).toLowerCase();
	if (ext !== ".png") {
		throw new Error("Only PNG input is supported right now.");
	}

	const outputPath = args.outputPath
		? path.resolve(args.outputPath)
		: inputPath.replace(/\.png$/i, "_nobg.png");

	const inputBuffer = fs.readFileSync(inputPath);
	const png = PNG.sync.read(inputBuffer);
	const processed = removeBackground(
		png,
		args.threshold,
		args.feather,
		Math.round(args.edgeTrim),
	);
	const outputBuffer = PNG.sync.write(processed);

	fs.writeFileSync(outputPath, outputBuffer);
	console.log(`Saved background-removed image to: ${outputPath}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
