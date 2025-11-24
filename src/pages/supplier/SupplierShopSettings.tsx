import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupplierAuth } from "@/hooks/useSupplierAuth";
import SupplierNav from "@/components/supplier/SupplierNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initialState = {
	business_name: "",
	description: "",
	logo_url: "",
	banner_url: "",
	location: "",
};

const SupplierShopSettings = () => {
	const { supplierId, signOut } = useSupplierAuth();
	const [form, setForm] = useState(initialState);
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		if (supplierId) fetchShopInfo();
		// eslint-disable-next-line
	}, [supplierId]);

	const fetchShopInfo = async () => {
		setLoading(true);
		const { data } = await supabase
			.from("suppliers")
			.select("business_name, description, logo_url, banner_url, location")
			.eq("id", supplierId)
			.single();
		if (data) setForm({
			business_name: data.business_name || "",
			description: data.description || "",
			logo_url: data.logo_url || "",
			banner_url: data.banner_url || "",
			location: data.location || "",
		});
		setLoading(false);
	};

	// Helper to upload image to Supabase Storage
	const uploadImage = async (file: File, type: "logo" | "banner") => {
		if (!supplierId) return null;
		const fileExt = file.name.split('.').pop();
		const filePath = `${type}s/${supplierId}.${fileExt}`;
		const { error } = await supabase.storage.from('supplier-assets').upload(filePath, file, { upsert: true });
		if (error) return null;
		const { data: publicUrl } = supabase.storage.from('supplier-assets').getPublicUrl(filePath);
		return publicUrl?.publicUrl || null;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, files } = e.target;
		if (!files || files.length === 0) return;
		setLoading(true);
		const url = await uploadImage(files[0], name === "logo_file" ? "logo" : "banner");
		if (url) setForm((prev) => ({ ...prev, [name === "logo_file" ? "logo_url" : "banner_url"]: url }));
		setLoading(false);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		const { error } = await supabase
			.from("suppliers")
			.update({
				business_name: form.business_name,
				description: form.description,
				logo_url: form.logo_url,
				banner_url: form.banner_url,
				location: form.location,
			})
			.eq("id", supplierId);
		setLoading(false);
		setSuccess(!error);
		setTimeout(() => setSuccess(false), 2000);
	};

	return (
		<div className="min-h-screen bg-background overflow-x-hidden">
			<SupplierNav onSignOut={signOut} />
			<div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 max-w-xl lg:ml-64 lg:max-w-[calc(100vw-16rem)]">
				<h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Shop Settings</h1>
				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="block mb-1 font-medium">Shop Name</label>
						<Input name="business_name" value={form.business_name} onChange={handleChange} required />
					</div>
					<div>
						<label className="block mb-1 font-medium">Location</label>
						<Input name="location" value={form.location} onChange={handleChange} />
					</div>
					<div>
						<label className="block mb-1 font-medium">Description</label>
						<Textarea name="description" value={form.description} onChange={handleChange} rows={4} required />
					</div>
					<div>
						<label className="block mb-1 font-medium">Logo</label>
						{form.logo_url && (
							<img src={form.logo_url} alt="Logo" className="h-16 w-16 rounded-full object-cover mb-2 border" />
						)}
						<Input type="file" name="logo_file" accept="image/*" onChange={handleFileChange} />
						<Input name="logo_url" value={form.logo_url} onChange={handleChange} placeholder="https://..." className="mt-2" />
					</div>
					<div>
						<label className="block mb-1 font-medium">Banner</label>
						{form.banner_url && (
							<img src={form.banner_url} alt="Banner" className="h-20 w-full object-cover mb-2 rounded" />
						)}
						<Input type="file" name="banner_file" accept="image/*" onChange={handleFileChange} />
						<Input name="banner_url" value={form.banner_url} onChange={handleChange} placeholder="https://..." className="mt-2" />
					</div>
					<Button type="submit" disabled={loading}>
						{loading ? "Saving..." : "Save Changes"}
					</Button>
					{success && <div className="text-green-600">Saved!</div>}
				</form>
			</div>
		</div>
	);
};

export default SupplierShopSettings;
