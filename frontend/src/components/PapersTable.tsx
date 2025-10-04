import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PapersTable() {
  const [papers, setPapers] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/papers")
      .then((res) => setPapers(res.data));
  }, []);

  const toggleExpand = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const categories = useMemo(() => {
    const unique = new Set(papers.map((p) => p.primary_category));
    return Array.from(unique);
  }, [papers]);

  const filtered = useMemo(() => {
    let temp = [...papers];
    if (search) {
      const s = search.toLowerCase();
      temp = temp.filter(
        (p) =>
          (p.Title && p.Title.toLowerCase().includes(s)) ||
          (p.abstract && p.abstract.toLowerCase().includes(s)) ||
          (p.conclusion && p.conclusion.toLowerCase().includes(s))
      );
    }
    if (categoryFilter) {
      temp = temp.filter((p) => p.primary_category === categoryFilter);
    }
    return temp;
  }, [papers, search, categoryFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-lg space-y-4">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
        Research Publications Dataset
      </h2>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-between">
        <Input
          placeholder="Search by title, abstract, conclusion..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-md"
        />

        <Select
          onValueChange={(val) => {
            setCategoryFilter(val === "all" ? null : val);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 text-white font-bold">#</TableHead>
              <TableHead className="w-64 text-white font-bold">Title</TableHead>
              <TableHead className="w-24 text-white font-bold">Date</TableHead>
              <TableHead className="w-16 text-white font-bold">Year</TableHead>
              <TableHead className="w-40 text-white font-bold">
                Category
              </TableHead>
              <TableHead className="w-32 text-white font-bold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((paper, index) => (
              <React.Fragment key={(currentPage - 1) * pageSize + index}>
                <TableRow>
                  <TableCell>
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell
                    className="truncate max-w-[16rem]"
                    title={paper.Title}
                  >
                    {paper.Link ? (
                      <a
                        href={paper.Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {paper.Title ?? "-"}
                      </a>
                    ) : (
                      <span>{paper.Title ?? "-"}</span>
                    )}
                  </TableCell>
                  <TableCell>{paper.date ?? "-"}</TableCell>
                  <TableCell>{paper.year ?? "-"}</TableCell>
                  <TableCell
                    className="truncate max-w-[10rem]"
                    title={paper.primary_category}
                  >
                    {paper.primary_category ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-black"
                      onClick={() =>
                        toggleExpand((currentPage - 1) * pageSize + index)
                      }
                    >
                      {expanded[(currentPage - 1) * pageSize + index]
                        ? "Hide"
                        : "Show"}{" "}
                      Details
                    </Button>
                  </TableCell>
                </TableRow>

                {expanded[(currentPage - 1) * pageSize + index] && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0 bg-gray-800">
                      {/* Scrollable container */}
                      <div className="max-h-80 overflow-y-auto p-4 bg-gray-900">
                        {paper.abstract && (
                          <div className="mb-4">
                            <strong className="text-lg text-white">
                              Abstract:
                            </strong>
                            <p className="text-gray-300 break-words">
                              {paper.abstract}
                            </p>
                          </div>
                        )}
                        {paper.conclusion && (
                          <div className="mb-4">
                            <strong className="text-lg text-white">
                              Conclusion:
                            </strong>
                            <p className="text-gray-300 break-words">
                              {paper.conclusion}
                            </p>
                          </div>
                        )}
                        {!paper.abstract && !paper.conclusion && (
                          <p className="text-gray-400 italic">
                            No details available
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-black"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="text-black"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
