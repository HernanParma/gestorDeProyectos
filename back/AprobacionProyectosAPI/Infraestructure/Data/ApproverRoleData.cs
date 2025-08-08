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
    public class ApproverRoleData : IEntityTypeConfiguration<ApproverRole>
    {
        public void Configure(EntityTypeBuilder<ApproverRole> builder)
        {
            builder.HasData(
                new ApproverRole { Id = 1, Name = "Lider de Área" },
                new ApproverRole { Id = 2, Name = "Gerente" },
                new ApproverRole { Id = 3, Name = "Director" },
                new ApproverRole { Id = 4, Name = "Comité Técnico" }
            );
        }
    }
}
