import { useState, useEffect } from "react";
import jsPDF from "jspdf";

export default function InventoryExplorer() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    fetch("https://sheetdb.io/api/v1/crd9ai4bqwo5b")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((item) => ({
          ...item,
          features: item.features ? item.features.split(",").map((f) => f.trim()) : [],
          options: item.options ? item.options.split(",").map((o) => o.trim()) : [],
          image: item.image?.includes("drive.google.com")
            ? item.image.replace("file/d/", "uc?id=").replace("/view?usp=sharing", "")
            : item.image,
        }));
        setInventory(formatted);
      });
  }, []);

  const handleToggleOption = (model, option) => {
    setSelectedOptions((prev) => {
      const existing = prev[model] || [];
      const updated = existing.includes(option)
        ? existing.filter((o) => o !== option)
        : [...existing, option];
      return { ...prev, [model]: updated };
    });
  };

  const handleDownloadPDF = (item) => {
    const doc = new jsPDF();
    doc.text(`Quote Summary: ${item.model}`, 10, 10);
    doc.text(`ETA: ${item.eta}`, 10, 20);
    doc.text(`Material: ${item.material}`, 10, 30);
    doc.text(`Length: ${item.length}`, 10, 40);
    doc.text(`Beam: ${item.beam}`, 10, 50);
    doc.text(`Weight: ${item.weight}`, 10, 60);
    doc.text(`Features: ${item.features.join(", ")}`, 10, 70);
    if (selectedOptions[item.model]) {
      doc.text(`Selected Options: ${selectedOptions[item.model].join(", ")}`, 10, 80);
    }
    doc.text("Pricing:", 10, 90);
    if (item.msrpMercury) doc.text(`Mercury: $${item.msrpMercury}`, 20, 100);
    if (item.msrpYamaha) doc.text(`Yamaha: $${item.msrpYamaha}`, 20, 110);
    if (item.msrpSuzuki) doc.text(`Suzuki: $${item.msrpSuzuki}`, 20, 120);
    if (item.msrpTohatsu) doc.text(`Tohatsu: $${item.msrpTohatsu}`, 20, 130);
    if (item.msrpRotax) doc.text(`Rotax: $${item.msrpRotax}`, 20, 140);
    doc.text(`Trailer MSRP: $${item.trailerMSRP}`, 20, 150);
    doc.save(`${item.model}-quote.pdf`);
  };

  const filtered = inventory.filter((item) => {
    const matchesSearch = item.model?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? item.category === category : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          placeholder="Search by model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <select onChange={(e) => setCategory(e.target.value)} style={{ padding: "0.5rem" }}>
          <option value="">All Categories</option>
          <option value="Classic">Classic</option>
          <option value="Jet">Jet</option>
          <option value="Adventure">Adventure</option>
        </select>
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {filtered.map((item) => (
          <div key={item.model} style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 0 5px rgba(0,0,0,0.1)", padding: "1rem" }}>
            <img
              src={item.image}
              alt={item.model}
              style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
              onError={(e) => (e.target.style.display = "none")}
            />
            <h2>{item.model}</h2>
            <a href={item.website} target="_blank" rel="noreferrer" style={{ color: "#0070f3" }}>View Model Page</a>
            <p><strong>ETA:</strong> {item.eta}</p>
            <p>
              <strong>Material:</strong> {item.material}<br />
              <strong>Length:</strong> {item.length}<br />
              <strong>Beam:</strong> {item.beam}<br />
              <strong>Shaft:</strong> {item.shaft}<br />
              <strong>Weight:</strong> {item.weight}
            </p>
            <p><strong>MSRP:</strong><br />
              {item.msrpMercury && `Mercury: $${item.msrpMercury}`}<br />
              {item.msrpYamaha && `Yamaha: $${item.msrpYamaha}`}<br />
              {item.msrpTohatsu && `Tohatsu: $${item.msrpTohatsu}`}<br />
              {item.msrpSuzuki && `Suzuki: $${item.msrpSuzuki}`}<br />
              {item.msrpRotax && `Rotax: $${item.msrpRotax}`}
            </p>
            <p><strong>Trailer MSRP:</strong> ${item.trailerMSRP}</p>
            <ul>
              {item.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {item.options.length > 0 && (
              <div>
                <p><strong>Select Options:</strong></p>
                {item.options.map((option) => (
                  <label key={option} style={{ display: "block" }}>
                    <input
                      type="checkbox"
                      checked={selectedOptions[item.model]?.includes(option) || false}
                      onChange={() => handleToggleOption(item.model, option)}
                    /> {option}
                  </label>
                ))}
              </div>
            )}
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <button onClick={() => alert('Contact form coming soon')} style={{ flex: 1 }}>Request Info</button>
              <button onClick={() => handleDownloadPDF(item)} style={{ flex: 1 }}>Download Quote</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

