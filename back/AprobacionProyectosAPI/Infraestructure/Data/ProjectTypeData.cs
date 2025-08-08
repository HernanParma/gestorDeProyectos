﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Infraestructure.Data
{
    public class ProjectTypeData : IEntityTypeConfiguration<ProjectType>
    {
        public void Configure(EntityTypeBuilder<ProjectType> builder)
        {
            builder.HasData(
                new ProjectType { Id = 1, Name = "Mejora de Procesos" },
                new ProjectType { Id = 2, Name = "Innovacion y Desarrollo" },
                new ProjectType { Id = 3, Name = "Infraestructura" },
                new ProjectType { Id = 4, Name = "Capacitacion Interna" }
            );
        }
    }
}
