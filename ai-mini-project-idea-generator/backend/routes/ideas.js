const express = require("express");
const { body, param, validationResult } = require("express-validator");
const supabase = require("../supabase");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
};
const allowedDomains = ["web","ai","iot","security","education","health","environment","productivity"];
const allowedDifficulties = ["beginner","intermediate","advanced"];

router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("saved_ideas").select("id,catalog_id,title,description,domain,difficulty,technologies,steps,created_at").eq("user_id", req.user.id).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    res.json({ ideas: data });
  } catch (error) { next(error); }
});

router.post("/", [
  body("catalogId").optional({nullable:true}).isString().isLength({max:80}).withMessage("Invalid idea identifier."),
  body("title").trim().isLength({min:3,max:120}).withMessage("Title must contain 3–120 characters."),
  body("description").trim().isLength({min:10,max:1000}).withMessage("Description must contain 10–1000 characters."),
  body("domain").isIn(allowedDomains).withMessage("Choose a valid project domain."),
  body("difficulty").isIn(allowedDifficulties).withMessage("Choose a valid difficulty level."),
  body("technologies").isArray({min:1,max:8}).withMessage("Provide 1–8 technologies."),
  body("technologies.*").isString().trim().isLength({min:1,max:50}).withMessage("Each technology must be 1–50 characters."),
  body("steps").isArray({min:1,max:8}).withMessage("Provide 1–8 project steps."),
  body("steps.*").isString().trim().isLength({min:3,max:200}).withMessage("Each step must be 3–200 characters."),
  validate
], async (req, res, next) => {
  try {
    const payload = {
      user_id: req.user.id,
      catalog_id: req.body.catalogId || null,
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      domain: req.body.domain,
      difficulty: req.body.difficulty,
      technologies: req.body.technologies.map(x => x.trim()),
      steps: req.body.steps.map(x => x.trim())
    };
    const { data: existing, error: findError } = payload.catalog_id
      ? await supabase.from("saved_ideas").select("id").eq("user_id", req.user.id).eq("catalog_id", payload.catalog_id).maybeSingle()
      : { data: null, error: null };
    if (findError) throw findError;
    if (existing) return res.status(409).json({ error: "You have already saved this idea." });
    const { data, error } = await supabase.from("saved_ideas").insert(payload).select("id,catalog_id,title,description,domain,difficulty,technologies,steps,created_at").single();
    if (error) {
      if (error.code === "23505") return res.status(409).json({ error: "You have already saved this idea." });
      throw error;
    }
    res.status(201).json({ idea: data });
  } catch (error) { next(error); }
});

router.delete("/:id", [param("id").isUUID().withMessage("Invalid idea ID."), validate], async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("saved_ideas").delete().eq("id", req.params.id).eq("user_id", req.user.id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Saved idea not found." });
    res.json({ message: "Idea removed from your shortlist." });
  } catch (error) { next(error); }
});

module.exports = router;
