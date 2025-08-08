using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

public class CreateProjectDto
{
    [Required(ErrorMessage = "El título es obligatorio.")]
    [StringLength(100, ErrorMessage = "El título no puede tener más de 100 caracteres.")]
    [DefaultValue("Nuevo proyecto")]
    public string Title { get; set; } = "";

    [Required(ErrorMessage = "La descripción es obligatoria.")]
    [StringLength(500, ErrorMessage = "La descripción no puede tener más de 500 caracteres.")]
    [DefaultValue("Descripción del proyecto")]
    public string Description { get; set; } = "";

    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un área válida.")]
    [DefaultValue(0)]
    public int Area { get; set; } = 0;

    [Range(1, int.MaxValue, ErrorMessage = "Debe seleccionar un tipo válido.")]
    [DefaultValue(0)]
    public int Type { get; set; } = 0;

    [Range(0.01, double.MaxValue, ErrorMessage = "El monto estimado debe ser mayor a cero.")]
    [DefaultValue(0.0)]
    public decimal EstimatedAmount { get; set; } = 0.0m;

    [Range(1, int.MaxValue, ErrorMessage = "La duración estimada debe ser mayor a cero.")]
    [DefaultValue(0)]
    public int EstimatedDuration { get; set; } = 0;

    [Range(1, int.MaxValue, ErrorMessage = "El usuario creador es obligatorio.")]
    [DefaultValue(0)]
    public int CreatedByUserId { get; set; } = 0;
}
