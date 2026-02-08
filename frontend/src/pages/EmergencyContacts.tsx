import { motion } from "framer-motion";
import { ArrowLeft, Check, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-api";

interface Contact {
	id: string;
	name: string;
	role: string;
	phone: string;
}

const defaultContacts: Contact[] = [
	{
		id: "1",
		name: "Dr. Martin",
		role: "General Practitioner",
		phone: "+33 1 23 45 67 89",
	},
	{
		id: "2",
		name: "Pharmacie Centrale",
		role: "Pharmacy",
		phone: "+33 1 98 76 54 32",
	},
	{ id: "3", name: "SAMU", role: "Emergency", phone: "15" },
];

export default function EmergencyContacts() {
	const navigate = useNavigate();
	const { data: me } = useMe();
	const [contacts, setContacts] = useState<Contact[]>(defaultContacts);

	// Add the logged-in user as a contact once data loads
	useEffect(() => {
		if (me) {
			setContacts((prev) => {
				if (prev.some((c) => c.id === "me")) return prev;
				return [
					...prev,
					{
						id: "me",
						name: me.user.name,
						role: me.user.relationship || "Family",
						phone: me.user.phone || "Not set",
					},
				];
			});
		}
	}, [me]);
	const [editing, setEditing] = useState<string | null>(null);
	const [adding, setAdding] = useState(false);
	const [form, setForm] = useState({ name: "", role: "", phone: "" });

	const startEdit = (contact: Contact) => {
		setEditing(contact.id);
		setForm({ name: contact.name, role: contact.role, phone: contact.phone });
	};

	const saveEdit = (id: string) => {
		setContacts((prev) =>
			prev.map((c) => (c.id === id ? { ...c, ...form } : c)),
		);
		setEditing(null);
		setForm({ name: "", role: "", phone: "" });
	};

	const addContact = () => {
		if (!form.name.trim() || !form.phone.trim()) return;
		setContacts((prev) => [...prev, { id: Date.now().toString(), ...form }]);
		setAdding(false);
		setForm({ name: "", role: "", phone: "" });
	};

	const deleteContact = (id: string) => {
		setContacts((prev) => prev.filter((c) => c.id !== id));
	};

	return (
		<div className="min-h-screen bg-background pb-24">
			<div className="max-w-md mx-auto px-5 pt-14">
				<button
					type="button"
					onClick={() => navigate("/resources")}
					className="mb-6 flex items-center gap-2 text-muted-foreground"
				>
					<ArrowLeft className="w-4 h-4" />
					<span className="text-sm font-medium">Back</span>
				</button>

				<div className="flex items-center justify-between mb-6">
					<motion.h1
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-xl font-bold text-foreground"
					>
						Emergency Contacts
					</motion.h1>
					<Button
						size="sm"
						variant="outline"
						onClick={() => {
							setAdding(true);
							setForm({ name: "", role: "", phone: "" });
						}}
					>
						<Plus className="w-4 h-4 mr-1" /> Add
					</Button>
				</div>

				{adding && (
					<motion.div
						initial={{ opacity: 0, y: -8 }}
						animate={{ opacity: 1, y: 0 }}
						className="rounded-xl border border-border bg-card p-4 mb-4 space-y-3"
					>
						<input
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							placeholder="Name"
							className="w-full text-sm bg-secondary/50 rounded-lg px-3 py-2 outline-none text-foreground placeholder:text-muted-foreground"
						/>
						<input
							value={form.role}
							onChange={(e) => setForm({ ...form, role: e.target.value })}
							placeholder="Role (e.g. Doctor)"
							className="w-full text-sm bg-secondary/50 rounded-lg px-3 py-2 outline-none text-foreground placeholder:text-muted-foreground"
						/>
						<input
							value={form.phone}
							onChange={(e) => setForm({ ...form, phone: e.target.value })}
							placeholder="Phone number"
							className="w-full text-sm bg-secondary/50 rounded-lg px-3 py-2 outline-none text-foreground placeholder:text-muted-foreground"
						/>
						<div className="flex gap-2">
							<Button size="sm" onClick={addContact}>
								<Check className="w-4 h-4 mr-1" /> Save
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => setAdding(false)}
							>
								<X className="w-4 h-4 mr-1" /> Cancel
							</Button>
						</div>
					</motion.div>
				)}

				<div className="space-y-3">
					{contacts.map((contact, i) => (
						<motion.div
							key={contact.id}
							initial={{ opacity: 0, x: -8 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: i * 0.05 }}
							className="rounded-xl bg-card shadow-veille p-4"
						>
							{editing === contact.id ? (
								<div className="space-y-2">
									<input
										value={form.name}
										onChange={(e) => setForm({ ...form, name: e.target.value })}
										className="w-full text-sm bg-secondary/50 rounded-lg px-3 py-2 outline-none text-foreground"
									/>
									<input
										value={form.role}
										onChange={(e) => setForm({ ...form, role: e.target.value })}
										className="w-full text-sm bg-secondary/50 rounded-lg px-3 py-2 outline-none text-foreground"
									/>
									<input
										value={form.phone}
										onChange={(e) =>
											setForm({ ...form, phone: e.target.value })
										}
										className="w-full text-sm bg-secondary/50 rounded-lg px-3 py-2 outline-none text-foreground"
									/>
									<div className="flex gap-2">
										<Button size="sm" onClick={() => saveEdit(contact.id)}>
											<Check className="w-4 h-4 mr-1" /> Save
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => setEditing(null)}
										>
											<X className="w-4 h-4 mr-1" /> Cancel
										</Button>
									</div>
								</div>
							) : (
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
										<Phone className="w-4 h-4 text-primary" />
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="text-sm font-bold text-foreground">
											{contact.name}
										</h3>
										<p className="text-xs text-muted-foreground">
											{contact.role}
										</p>
										<a
											href={`tel:${contact.phone}`}
											className="text-xs text-primary font-medium"
										>
											{contact.phone}
										</a>
									</div>
									<div className="flex gap-1">
										<button
											type="button"
											onClick={() => startEdit(contact)}
											className="p-2 rounded-lg hover:bg-secondary transition-colors"
										>
											<Pencil className="w-3.5 h-3.5 text-muted-foreground" />
										</button>
										<button
											type="button"
											onClick={() => deleteContact(contact.id)}
											className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
										>
											<Trash2 className="w-3.5 h-3.5 text-destructive" />
										</button>
									</div>
								</div>
							)}
						</motion.div>
					))}
				</div>
			</div>
		</div>
	);
}
