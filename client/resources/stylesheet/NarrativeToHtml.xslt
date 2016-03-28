<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:cda="urn:hl7-org:v3" xmlns="http://www.w3.org/1999/xhtml">
	<xsl:output omit-xml-declaration="yes" method="xml" version="1.0" encoding="UTF-8" indent="yes"/>
	
	<xsl:template match="/cda:paragraph">
		<p xmlns="http://www.w3.org/1999/xhtml">
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates />
		</p>
	</xsl:template>
	
	<xsl:template match="node()|@*">
		<xsl:copy>
			<xsl:apply-templates select="node()|@*"/>
		</xsl:copy>
	</xsl:template>
	
	<xsl:template match="cda:content[contains(@styleCode, 'font-weight: bold')]" priority="1">
		<strong>
			<xsl:apply-templates />
		</strong>
	</xsl:template>
	
	<xsl:template match="cda:content[contains(@styleCode, 'font-style: italic')]" priority="1">
		<em>
			<xsl:apply-templates />
		</em>
	</xsl:template>
	
	<xsl:template match="cda:content[contains(@styleCode, 'text-decoration: underline')]" priority="1">
		<span style="text-decoration: underline;">
			<xsl:apply-templates />
		</span>
	</xsl:template>
	
	<xsl:template match="cda:content">
		<span>
			<xsl:apply-templates select="./@*" />
			<xsl:apply-templates />
		</span>
	</xsl:template>
	
	<xsl:template match="cda:span|cda:div">
		<paragraph>
			<xsl:apply-templates select="@ID | @styleCode" />			
			<xsl:apply-templates/>
		</paragraph>
	</xsl:template>
	
	<xsl:template match="cda:paragraph">
		<p>
			<xsl:apply-templates select="@ID | @styleCode" />			
			<xsl:apply-templates/>
		</p>
	</xsl:template>
	
	<xsl:template match="cda:linkHref">
		<a>
			<xsl:apply-templates select="@ID | @styleCode | @href" />			
			<xsl:apply-templates/>
		</a>
	</xsl:template>
	
	<xsl:template match="cda:br">
		<br>
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates/>
		</br>
	</xsl:template>
	
	<xsl:template match="cda:sub">
		<sub>
			<xsl:apply-templates select="@*" />			
			<xsl:apply-templates/>
		</sub>
	</xsl:template>
	
	<xsl:template match="cda:sup">
		<sup>
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates/>
		</sup>
	</xsl:template>
	
	<!-- Lists -->
	<xsl:template match="cda:list[not(@listType) or @listType='unordered']">
		<ul>
			<xsl:apply-templates select="@ID | @styleCode" />
			<xsl:apply-templates />
		</ul>
	</xsl:template>
	
	<xsl:template match="cda:list[@listType='ordered']">
		<ol>
			<xsl:apply-templates select="@ID | @styleCode" />
			<xsl:apply-templates />
		</ol>
	</xsl:template>
	
	<xsl:template match="cda:item">
		<li>
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates />
		</li>
	</xsl:template>
	
	<!-- Tables -->
	<xsl:template match="cda:table">
		<table>	
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates/>
		</table>	
	</xsl:template>
	
	<xsl:template match="cda:thead">
		<thead>	
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates/>
		</thead>	
	</xsl:template>

	<xsl:template match="cda:tfoot">
		<tfoot>	
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates/>
		</tfoot>	
	</xsl:template>

	<xsl:template match="cda:tbody">
		<tbody>	
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates/>
		</tbody>	
	</xsl:template>

	<xsl:template match="cda:colgroup">
		<colgroup>	
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates/>
		</colgroup>	
	</xsl:template>

	<xsl:template match="cda:col">
		<col>	
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates/>
		</col>	
	</xsl:template>

	<xsl:template match="cda:tr">
		<tr>	
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates/>
		</tr>	
	</xsl:template>

	<xsl:template match="cda:th">
		<th>	
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates/>
		</th>	
	</xsl:template>

	<xsl:template match="cda:td">
		<td>	
			<xsl:apply-templates select="@*" />
			<xsl:apply-templates/>
		</td>	
	</xsl:template>
	
	<xsl:template match="@ID">
		<xsl:attribute name="id"><xsl:value-of select="." /></xsl:attribute>
	</xsl:template>
	<xsl:template match="@styleCode">
		<xsl:attribute name="style"><xsl:value-of select="." /></xsl:attribute>
	</xsl:template>
</xsl:stylesheet>
