import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, PlusCircle } from "lucide-react";
import { useState } from "react";

interface Link {
	url: string;
	shortcut: string;
	name: string;
	createdAt: string;
}

export default function Component() {
	const [links, setLinks] = useState<Link[]>([
		{
			url: "https://example.com",
			shortcut: "ex1",
			name: "Example 1",
			createdAt: "2023-05-01",
		},
		{
			url: "https://example.org",
			shortcut: "ex2",
			name: "Example 2",
			createdAt: "2023-05-02",
		},
		{
			url: "https://example.net",
			shortcut: "ex3",
			name: "Example 3",
			createdAt: "2023-05-03",
		},
	]);

	const [newLink, setNewLink] = useState<Link>({
		url: "",
		shortcut: "",
		name: "",
		createdAt: "",
	});

	const handleCreateLink = () => {
		setLinks([
			...links,
			{
				...newLink,
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				createdAt: new Date().toISOString().split("T")[0]!,
			},
		]);
		setNewLink({ url: "", shortcut: "", name: "", createdAt: "" });
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">URL Shortener</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{links.map((link, index) => (
					<div
						key={link.url}
						className="bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:border-yellow-400 hover:border-2 group"
					>
						<h2 className="text-xl font-semibold mb-2">{link.name}</h2>
						<p className="text-sm text-gray-600 mb-2">
							Created: {link.createdAt}
						</p>
						<div className="flex items-center mb-2">
							<span className="font-medium mr-2">Shortcut:</span>
							<code className="bg-gray-100 px-2 py-1 rounded">
								{link.shortcut}
							</code>
							<Button variant="ghost" size="icon" className="ml-2">
								<Copy className="h-4 w-4" />
							</Button>
						</div>
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-500 hover:underline flex items-center"
						>
							{link.url}
							<ExternalLink className="h-4 w-4 ml-1" />
						</a>
					</div>
				))}
			</div>
			<Dialog>
				<DialogTrigger asChild>
					<Button className="mt-4">
						<PlusCircle className="mr-2 h-4 w-4" />
						Create new link
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Create new link</DialogTitle>
						<DialogDescription>
							Enter the details for your new shortened link.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name
							</Label>
							<Input
								id="name"
								value={newLink.name}
								onChange={(e) =>
									setNewLink({ ...newLink, name: e.target.value })
								}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="url" className="text-right">
								URL
							</Label>
							<Input
								id="url"
								value={newLink.url}
								onChange={(e) =>
									setNewLink({ ...newLink, url: e.target.value })
								}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="shortcut" className="text-right">
								Shortcut
							</Label>
							<Input
								id="shortcut"
								value={newLink.shortcut}
								onChange={(e) =>
									setNewLink({ ...newLink, shortcut: e.target.value })
								}
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" onClick={handleCreateLink}>
							Create link
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
