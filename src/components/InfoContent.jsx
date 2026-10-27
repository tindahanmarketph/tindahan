import { Fragment } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

/* Texte enrichi très simple : **gras** et [libellé](lien) */
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

export function Inline({ text }) {
  const parts = String(text).split(TOKEN).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

    if (link) {
      const [, label, href] = link;

      if (href.startsWith("/")) {
        return (
          <Link key={index} to={href}>
            {label}
          </Link>
        );
      }

      const external = href.startsWith("http");

      return (
        <a
          key={index}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {label}
        </a>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}

const NOTE_ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle };

export function Blocks({ blocks = [] }) {
  return blocks.map((block, index) => {
    switch (block.t) {
      case "p":
        return (
          <p key={index}>
            <Inline text={block.x} />
          </p>
        );

      case "h3":
        return <h3 key={index}>{block.x}</h3>;

      case "ul":
        return (
          <ul key={index}>
            {block.items.map((item, i) => (
              <li key={i}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        );

      case "ol":
        return (
          <ol key={index}>
            {block.items.map((item, i) => (
              <li key={i}>
                <Inline text={item} />
              </li>
            ))}
          </ol>
        );

      case "note": {
        const Icon = NOTE_ICONS[block.tone] || Info;

        return (
          <div key={index} className={`info-note info-note-${block.tone || "info"}`}>
            <Icon size={20} aria-hidden="true" />
            <p>
              <Inline text={block.x} />
            </p>
          </div>
        );
      }

      case "table":
        return (
          <div key={index} className="info-table-wrap" tabIndex={0}>
            <table className="info-table">
              <thead>
                <tr>
                  {block.head.map((cell, i) => (
                    <th key={i} scope="col">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c}>
                        <Inline text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  });
}
